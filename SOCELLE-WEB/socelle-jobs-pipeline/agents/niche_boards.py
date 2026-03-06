"""
agents/niche_boards.py — Agent J3: Niche beauty job board scraper.

Schedule: Weekly (Wednesday 4am UTC)
Sources: 6 beauty-specific job boards
All results must have apply_url pointing to the original listing.
"""

import time
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup

from config import NICHE_BOARDS
from agents.classify import classify_beauty_job
from utils.dedup import upsert_job
from utils.logger import log_ingestion, log_error

HEADERS = {
    "User-Agent": "Socelle Job Aggregator/1.0 (https://socelle.com; jobs@socelle.com)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

REQUEST_TIMEOUT = 20
DELAY = 3


def scrape_board(board: dict) -> list[dict]:
    """Scrape a single niche job board using its CSS selectors."""
    url       = board["url"]
    selectors = board.get("selectors", {})

    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        log_error("niche_boards.fetch", url, str(e))
        return []

    soup     = BeautifulSoup(resp.text, "lxml")
    parsed_base = urlparse(url)
    base_url = f"{parsed_base.scheme}://{parsed_base.netloc}"

    card_sel     = selectors.get("job_card", ".job, article, .listing")
    title_sel    = selectors.get("title", "h2, h3, .title")
    location_sel = selectors.get("location", ".location, .city")
    link_sel     = selectors.get("link", "a")

    cards = soup.select(card_sel)
    if not cards:
        # Fallback: look for any anchor with job-like text
        cards = soup.select("li, article, .job-listing")

    jobs = []
    for card in cards:
        try:
            title_el    = card.select_one(title_sel)
            location_el = card.select_one(location_sel)
            link_el     = card.select_one(link_sel)

            title    = title_el.get_text(strip=True) if title_el else None
            location = location_el.get_text(strip=True) if location_el else ""
            href     = link_el.get("href") if link_el else None

            if not title or len(title) < 5:
                continue

            # Resolve relative URLs
            if href and href.startswith("/"):
                href = base_url + href
            elif href and not href.startswith("http"):
                href = base_url + "/" + href

            # Parse location
            parts = [p.strip() for p in location.split(",")]
            city  = parts[0] if parts else None
            state = parts[1] if len(parts) > 1 else None

            jobs.append({
                "title":           title,
                "company_name":    board["name"],  # board name as fallback company
                "description":     "",
                "apply_url":       href,
                "apply_is_direct": False,
                "source":          "niche_board",
                "source_publisher": board["name"],
                "city":            city,
                "state":           state,
                "country":         "US",
                "salary_currency": "USD",
            })
        except Exception:
            continue

    return jobs


def run(client) -> dict:
    """Scrape all niche boards. Returns stats dict."""
    stats = {"inserted": 0, "updated": 0, "skipped": 0, "errors": 0}

    for board in NICHE_BOARDS:
        name = board["name"]
        print(f"[J3] Scraping {name}…")

        raw_jobs = scrape_board(board)
        print(f"  [J3] {name}: {len(raw_jobs)} raw results")

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

        time.sleep(DELAY)

    log_ingestion(
        source="niche_boards",
        status="success",
        records_inserted=stats["inserted"],
        records_updated=stats["updated"],
        records_failed=stats["errors"],
        metadata={"boards": len(NICHE_BOARDS)},
    )

    print(f"[J3] Done: inserted={stats['inserted']} updated={stats['updated']} errors={stats['errors']}")
    return stats
