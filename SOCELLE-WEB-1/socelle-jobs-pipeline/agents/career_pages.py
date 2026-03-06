"""
agents/career_pages.py — Agent J2: Direct employer career page scraper.

Schedule: Weekly (Monday 3am UTC)
Sources: 15 major beauty employer career pages
Methods: JSON-LD extraction (primary), HTML parse (fallback), ATS API (Greenhouse/Lever)
"""

import json
import time
import re
from datetime import datetime, timezone, timedelta

import requests
from bs4 import BeautifulSoup

from config import CAREER_PAGES
from agents.classify import classify_beauty_job
from utils.dedup import upsert_job
from utils.logger import log_ingestion, log_error

HEADERS = {
    "User-Agent": "Socelle Job Aggregator/1.0 (https://socelle.com; jobs@socelle.com)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

REQUEST_TIMEOUT = 20
DELAY_BETWEEN_PAGES = 3  # seconds


# ── Method 1: JSON-LD extraction ──────────────────────────────────

def scrape_json_ld(url: str) -> list[dict]:
    """Extract JobPosting schema.org entries from JSON-LD scripts."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        log_error("career_pages.json_ld", url, str(e))
        return []

    soup = BeautifulSoup(resp.text, "lxml")
    jobs = []
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            if not script.string:
                continue
            data = json.loads(script.string)
            if isinstance(data, list):
                jobs.extend([j for j in data if j.get("@type") == "JobPosting"])
            elif isinstance(data, dict):
                if data.get("@type") == "JobPosting":
                    jobs.append(data)
                # Some pages nest under @graph
                for item in data.get("@graph", []):
                    if item.get("@type") == "JobPosting":
                        jobs.append(item)
        except Exception:
            continue
    return jobs


def json_ld_to_job(data: dict, employer: dict) -> dict:
    """Map JSON-LD JobPosting to socelle.jobs insert dict."""
    # Location
    location = data.get("jobLocation", {})
    address  = location.get("address", {}) if isinstance(location, dict) else {}
    if isinstance(address, list):
        address = address[0] if address else {}
    city   = address.get("addressLocality", "")
    state  = address.get("addressRegion", "")

    # Salary
    base_salary = data.get("baseSalary", {})
    value       = base_salary.get("value", {}) if isinstance(base_salary, dict) else {}
    salary_min  = value.get("minValue") if isinstance(value, dict) else None
    salary_max  = value.get("maxValue") if isinstance(value, dict) else None
    unit_text   = (value.get("unitText") or "").upper() if isinstance(value, dict) else ""
    salary_type = "annual" if "YEAR" in unit_text else ("hourly" if "HOUR" in unit_text else None)

    # Employment type
    emp_type_raw = str(data.get("employmentType") or "FULL_TIME").upper()
    emp_map = {
        "FULL_TIME": "Full-time", "PART_TIME": "Part-time",
        "CONTRACTOR": "Contract", "TEMPORARY": "Temporary",
        "INTERN": "Internship",
    }
    job_type = emp_map.get(emp_type_raw, "Full-time")

    # Apply URL
    apply_url = (
        data.get("url")
        or data.get("directApply")
        or data.get("applicationContact", {}).get("url") if isinstance(data.get("applicationContact"), dict) else None
    )

    # Expiry
    valid_through = data.get("validThrough")

    return {
        "title":           str(data.get("title") or "").strip(),
        "company_name":    employer["name"],
        "description":     str(data.get("description") or ""),
        "apply_url":       str(apply_url) if apply_url else None,
        "apply_is_direct": False,
        "source":          "career_page",
        "source_publisher": employer["name"],
        "city":            city,
        "state":           state,
        "country":         "US",
        "salary_min":      float(salary_min) if salary_min else None,
        "salary_max":      float(salary_max) if salary_max else None,
        "salary_type":     salary_type,
        "salary_currency": "USD",
        "job_type":        job_type,
        "is_remote":       "TELECOMMUTE" in str(data.get("jobLocationType") or "").upper(),
        "expires_at":      valid_through,
    }


# ── Method 2: HTML parse ──────────────────────────────────────────

def scrape_html_careers(url: str, selectors: dict) -> list[dict]:
    """Parse career page HTML using CSS selectors."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        log_error("career_pages.html_parse", url, str(e))
        return []

    soup = BeautifulSoup(resp.text, "lxml")
    listings = soup.select(selectors.get("job_card", ".job"))
    jobs = []

    for listing in listings:
        try:
            title_el    = listing.select_one(selectors.get("title", "h2, h3"))
            location_el = listing.select_one(selectors.get("location", ".location"))
            link_el     = listing.select_one(selectors.get("link", "a"))

            title    = title_el.get_text(strip=True) if title_el else None
            location = location_el.get_text(strip=True) if location_el else ""
            href     = link_el.get("href") if link_el else None

            if not title:
                continue

            # Resolve relative URLs
            if href and href.startswith("/"):
                from urllib.parse import urlparse
                parsed = urlparse(url)
                href = f"{parsed.scheme}://{parsed.netloc}{href}"

            jobs.append({
                "title":    title,
                "location": location,
                "apply_url": href,
            })
        except Exception:
            continue

    return jobs


def html_to_job(data: dict, employer: dict) -> dict:
    """Map scraped HTML job to insert dict."""
    location = data.get("location", "")
    parts    = [p.strip() for p in location.split(",")]
    city     = parts[0] if parts else None
    state    = parts[1] if len(parts) > 1 else None

    return {
        "title":           data.get("title", "").strip(),
        "company_name":    employer["name"],
        "description":     "",  # HTML parse rarely has full description
        "apply_url":       data.get("apply_url"),
        "apply_is_direct": False,
        "source":          "career_page",
        "source_publisher": employer["name"],
        "city":            city,
        "state":           state,
        "country":         "US",
        "salary_currency": "USD",
    }


# ── Method 3: ATS API ─────────────────────────────────────────────

def scrape_greenhouse(ats_slug: str) -> list[dict]:
    """Fetch jobs from Greenhouse public API."""
    url = f"https://boards-api.greenhouse.io/v1/boards/{ats_slug}/jobs?content=true"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        return data.get("jobs", [])
    except Exception as e:
        log_error("career_pages.greenhouse", ats_slug, str(e))
        return []


def scrape_lever(ats_slug: str) -> list[dict]:
    """Fetch jobs from Lever public API."""
    url = f"https://api.lever.co/v0/postings/{ats_slug}?mode=json"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.json() if isinstance(resp.json(), list) else []
    except Exception as e:
        log_error("career_pages.lever", ats_slug, str(e))
        return []


def ats_to_job(data: dict, employer: dict, ats_type: str) -> dict:
    """Map ATS API response to insert dict."""
    if ats_type == "greenhouse":
        location = data.get("location", {})
        loc_name = location.get("name", "") if isinstance(location, dict) else str(location)
        parts    = [p.strip() for p in loc_name.split(",")]
        return {
            "title":           str(data.get("title") or "").strip(),
            "company_name":    employer["name"],
            "description":     str(data.get("content") or ""),
            "apply_url":       data.get("absolute_url"),
            "apply_is_direct": False,
            "source":          "career_page",
            "source_publisher": employer["name"],
            "source_job_id":   str(data.get("id", "")),
            "city":            parts[0] if parts else None,
            "state":           parts[1] if len(parts) > 1 else None,
            "country":         "US",
            "salary_currency": "USD",
        }
    elif ats_type == "lever":
        categories = data.get("categories", {})
        return {
            "title":           str(data.get("text") or "").strip(),
            "company_name":    employer["name"],
            "description":     str(data.get("descriptionPlain") or data.get("description") or ""),
            "apply_url":       data.get("hostedUrl") or data.get("applyUrl"),
            "apply_is_direct": False,
            "source":          "career_page",
            "source_publisher": employer["name"],
            "source_job_id":   str(data.get("id", "")),
            "city":            categories.get("location"),
            "state":           None,
            "country":         "US",
            "salary_currency": "USD",
        }
    return {}


# ── Main ──────────────────────────────────────────────────────────

def run(client) -> dict:
    """Scrape all configured career pages. Returns stats dict."""
    stats = {"inserted": 0, "updated": 0, "skipped": 0, "errors": 0}

    for employer in CAREER_PAGES:
        name   = employer["name"]
        method = employer.get("method", "json_ld")
        print(f"[J2] Scraping {name} via {method}…")

        raw_jobs: list[dict] = []

        try:
            if method == "json_ld":
                ld_results = scrape_json_ld(employer["careers_url"])
                raw_jobs = [json_ld_to_job(j, employer) for j in ld_results]

            elif method == "html_parse":
                # Fallback: try JSON-LD first, then HTML parse
                ld_results = scrape_json_ld(employer["careers_url"])
                if ld_results:
                    raw_jobs = [json_ld_to_job(j, employer) for j in ld_results]
                else:
                    selectors = employer.get("selectors", {})
                    html_results = scrape_html_careers(employer["careers_url"], selectors)
                    raw_jobs = [html_to_job(j, employer) for j in html_results]

            elif method == "ats_api":
                ats_type = employer.get("ats_type", "greenhouse")
                ats_slug = employer.get("ats_slug", "")
                if ats_type == "greenhouse":
                    ats_results = scrape_greenhouse(ats_slug)
                elif ats_type == "lever":
                    ats_results = scrape_lever(ats_slug)
                else:
                    ats_results = []
                raw_jobs = [ats_to_job(j, employer, ats_type) for j in ats_results]

        except Exception as e:
            log_error("career_pages", name, str(e))
            stats["errors"] += 1
            continue

        print(f"  [J2] {name}: {len(raw_jobs)} raw results")

        for raw in raw_jobs:
            if not raw.get("title"):
                stats["skipped"] += 1
                continue
            classified = classify_beauty_job(raw)
            if not classified:
                stats["skipped"] += 1
                continue

            result = upsert_job(classified)
            if result["action"] == "inserted":
                stats["inserted"] += 1
            elif result["action"] == "updated":
                stats["updated"] += 1
            else:
                stats["skipped"] += 1

        time.sleep(DELAY_BETWEEN_PAGES)

    log_ingestion(
        source="career_pages",
        status="success",
        records_inserted=stats["inserted"],
        records_updated=stats["updated"],
        records_failed=stats["errors"],
        metadata={"employers": len(CAREER_PAGES)},
    )

    print(f"[J2] Done: inserted={stats['inserted']} updated={stats['updated']} errors={stats['errors']}")
    return stats
