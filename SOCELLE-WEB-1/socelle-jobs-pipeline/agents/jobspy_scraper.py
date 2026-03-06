"""
agents/jobspy_scraper.py — Agent J1: JobSpy multi-board scraper.

Schedule: Every 6 hours (Railway cron)
Covers: 14 countries in rotation, 30 beauty search terms
Sources: Indeed, LinkedIn, Google, Glassdoor, ZipRecruiter (per country config)

Each 6-hour cycle covers one country in rotation (4 base countries = 1 full pass/day).
Wave 1 + Wave 2 countries run on a slower rotation mixed in.
"""

import time
import hashlib
from datetime import datetime, timezone, timedelta

try:
    from jobspy import scrape_jobs
    JOBSPY_AVAILABLE = True
except ImportError:
    JOBSPY_AVAILABLE = False
    print("[jobspy] python-jobspy not installed. Scraper will be a no-op.")

from config import COUNTRIES, SEARCH_TERMS
from agents.classify import classify_beauty_job
from utils.dedup import upsert_job
from utils.logger import log_ingestion, log_error
from utils.google_indexing import notify_new_jobs


# ── Cycle counter (persisted via Supabase ingestion_jobs count) ──
def get_cycle_number(client) -> int:
    """Count completed jobspy ingestion runs to determine rotation position."""
    try:
        result = client.schema("socelle").table("ingestion_jobs") \
            .select("id", count="exact") \
            .eq("source", "jobspy") \
            .eq("status", "success") \
            .execute()
        return result.count or 0
    except Exception:
        return 0


def get_country_for_cycle(cycle: int) -> dict:
    """
    Rotate through countries per cycle.
    Wave 0 countries run every 4 cycles (every 24h).
    Wave 1 countries run every 14 cycles (every ~3.5 days).
    Wave 2 countries run every 14 cycles offset.
    """
    # Base cycle: rotate through all 4 wave-0 countries every 24h
    base_countries = [c for c in COUNTRIES if c["wave"] == 0]
    wave1_countries = [c for c in COUNTRIES if c["wave"] == 1]
    wave2_countries = [c for c in COUNTRIES if c["wave"] == 2]

    # Every 4 cycles, also run one wave1 country
    if cycle % 8 == 7:  # cycle 7, 15, 23...
        idx = (cycle // 8) % max(len(wave1_countries), 1)
        return wave1_countries[idx] if wave1_countries else base_countries[cycle % len(base_countries)]

    # Every 12 cycles, also run one wave2 country
    if cycle % 16 == 15:
        idx = (cycle // 16) % max(len(wave2_countries), 1)
        return wave2_countries[idx] if wave2_countries else base_countries[cycle % len(base_countries)]

    # Default: wave 0 rotation
    return base_countries[cycle % len(base_countries)]


def parse_location(location_str: str, country_code: str) -> tuple[str | None, str | None]:
    """Parse 'City, State' or 'City' location string."""
    if not location_str:
        return None, None
    parts = [p.strip() for p in location_str.split(",")]
    if len(parts) >= 2:
        return parts[0], parts[1]
    if len(parts) == 1:
        return parts[0], None
    return None, None


def jobspy_to_supabase(row: dict, country: dict) -> dict:
    """Map a JobSpy DataFrame row to a socelle.jobs insert dict."""
    location = str(row.get("location") or "")
    city, state = parse_location(location, country["code"])

    # Normalize job_type
    job_type_raw = str(row.get("job_type") or "").lower()
    job_type_map = {
        "fulltime": "Full-time", "full_time": "Full-time", "full-time": "Full-time",
        "parttime": "Part-time", "part_time": "Part-time", "part-time": "Part-time",
        "contract": "Contract", "contractor": "Contract",
        "internship": "Internship", "temporary": "Temporary",
    }
    job_type = job_type_map.get(job_type_raw, job_type_raw.title() or "Full-time")

    # Normalize salary type
    interval = str(row.get("interval") or row.get("salary_type") or "").lower()
    salary_type = "annual" if "year" in interval or "annual" in interval else ("hourly" if "hour" in interval else None)

    # apply_url — job_url is the clickable link (the posting page)
    apply_url = str(row.get("job_url") or row.get("job_url_direct") or "")
    source_url = str(row.get("job_url_direct") or "")

    return {
        "title":             str(row.get("title") or "").strip(),
        "company_name":      str(row.get("company_name") or "").strip(),
        "description":       str(row.get("description") or ""),
        "apply_url":         apply_url or None,
        "apply_is_direct":   False,  # JobSpy links to board listing, not employer
        "source":            "jobspy",
        "source_publisher":  str(row.get("site") or "indeed").lower(),
        "source_job_id":     str(row.get("id") or ""),
        "source_url":        source_url or None,
        "city":              city,
        "state":             state,
        "country":           country["code"],
        "salary_min":        float(row["min_amount"]) if row.get("min_amount") else None,
        "salary_max":        float(row["max_amount"]) if row.get("max_amount") else None,
        "salary_type":       salary_type,
        "salary_currency":   country["currency"],
        "job_type":          job_type,
        "is_remote":         bool(row.get("is_remote", False)),
        "employer_logo_url": str(row.get("company_logo") or "") or None,
    }


def run(client) -> dict:
    """Run one JobSpy cycle. Returns stats dict."""
    if not JOBSPY_AVAILABLE:
        return {"skipped": True, "reason": "python-jobspy not installed"}

    cycle = get_cycle_number(client)
    country = get_country_for_cycle(cycle)

    # Pick 5 search terms for this cycle (rotate through 30)
    batch_start = (cycle * 5) % len(SEARCH_TERMS)
    terms_batch = SEARCH_TERMS[batch_start:batch_start + 5]

    print(f"[J1] Cycle {cycle} | Country: {country['code']} | Terms: {terms_batch}")

    stats = {"inserted": 0, "updated": 0, "skipped": 0, "errors": 0, "country": country["code"], "google_indexed": 0}
    new_slugs: list[str] = []
    all_raw_jobs: list[dict] = []

    sites_for_country = [s for s in country["sites"] if s in ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google"]]

    for term in terms_batch:
        # National search (no location = broadest results)
        try:
            df = scrape_jobs(
                site_name=sites_for_country,
                search_term=term,
                results_wanted=country["national_results_wanted"],
                hours_old=168,  # last 7 days
                country_indeed=country["country_indeed"],
            )
            if df is not None and not df.empty:
                all_raw_jobs.extend(df.to_dict("records"))
                print(f"  [J1] national {term}: {len(df)} results")
        except Exception as e:
            log_error("jobspy_national", f"{country['code']}:{term}", str(e))
            stats["errors"] += 1

        time.sleep(2)  # polite delay between requests

        # Region-specific searches
        regions = country["primary_regions"]
        if country["code"] == "US" and country.get("secondary_regions"):
            # US: rotate 10 secondary states per cycle
            sec_start = (cycle * 10) % len(country["secondary_regions"])
            regions = regions + country["secondary_regions"][sec_start:sec_start + 10]

        region_sites = [s for s in ["indeed", "google"] if s in sites_for_country]

        for region in regions:
            try:
                df = scrape_jobs(
                    site_name=region_sites,
                    search_term=term,
                    location=region,
                    results_wanted=country["region_results_wanted"],
                    hours_old=168,
                    country_indeed=country["country_indeed"],
                )
                if df is not None and not df.empty:
                    all_raw_jobs.extend(df.to_dict("records"))
            except Exception as e:
                log_error("jobspy_region", f"{country['code']}:{term}:{region}", str(e))
                stats["errors"] += 1

            time.sleep(1)

    print(f"[J1] Raw results: {len(all_raw_jobs)}")

    # Process, classify, and upsert
    seen_hashes: set[str] = set()
    for raw in all_raw_jobs:
        mapped = jobspy_to_supabase(raw, country)
        classified = classify_beauty_job(mapped)
        if not classified:
            stats["skipped"] += 1
            continue

        # In-memory dedup (same job from different sites in same batch)
        import hashlib as _h
        key = _h.md5(f"{classified['title']}|{classified['company_name']}|{classified.get('city', '')}".lower().encode()).hexdigest()
        if key in seen_hashes:
            stats["skipped"] += 1
            continue
        seen_hashes.add(key)

        result = upsert_job(classified)
        if result["action"] == "inserted":
            stats["inserted"] += 1
            if result.get("slug"):
                new_slugs.append(result["slug"])
        elif result["action"] == "updated":
            stats["updated"] += 1
        else:
            stats["skipped"] += 1

    # Notify Google Indexing API for newly inserted jobs (batch, max 180/day)
    if new_slugs:
        gindex = notify_new_jobs(new_slugs)
        stats["google_indexed"] = gindex["sent"]
        print(f"[J1] Google indexed: {gindex}")

    log_ingestion(
        source="jobspy",
        status="success",
        records_fetched=len(all_raw_jobs),
        records_inserted=stats["inserted"],
        records_updated=stats["updated"],
        records_failed=stats["errors"],
        metadata={"country": country["code"], "terms": terms_batch, "cycle": cycle},
    )

    print(f"[J1] Done: inserted={stats['inserted']} updated={stats['updated']} skipped={stats['skipped']} errors={stats['errors']}")
    return stats
