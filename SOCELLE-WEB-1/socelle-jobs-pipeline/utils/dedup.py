"""
utils/dedup.py — Deduplication and upsert logic.

Dedup hash: md5(lower(title)|lower(company)|lower(city)|lower(state)|lower(country))
Country is included so the same role at the same company in London vs Austin = 2 records.

Source priority (lower index = higher priority, wins in conflict):
  career_page > google > indeed > linkedin > zip_recruiter > glassdoor > niche_board > jobspy
"""

import hashlib
import re
import time
from datetime import datetime, timezone, timedelta
from typing import Optional
from config import SOURCE_PRIORITY
from utils.supabase_client import get_client
from utils.logger import log_error


def compute_dedup_hash(title: str, company: str, city: str, state: str, country: str) -> str:
    raw = "|".join([
        title.lower().strip(),
        company.lower().strip(),
        (city or "").lower().strip(),
        (state or "").lower().strip(),
        (country or "").lower().strip(),
    ])
    return hashlib.md5(raw.encode()).hexdigest()


def source_priority(source: str) -> int:
    """Lower number = higher priority."""
    try:
        return SOURCE_PRIORITY.index(source)
    except ValueError:
        return len(SOURCE_PRIORITY)


def slugify(text: str) -> str:
    """Generate a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text[:80]  # cap length


def generate_slug(title: str, company: str, city: str, state: str) -> str:
    parts = [title, company]
    if city:
        parts.append(city)
    if state:
        parts.append(state)
    base = slugify("-".join(parts))
    # Append 6-char hash for uniqueness guarantee
    h = hashlib.md5(base.encode()).hexdigest()[:6]
    return f"{base}-{h}"


def upsert_job(job: dict) -> dict:
    """
    Upsert a single classified job into socelle.jobs.

    On conflict (dedup_hash):
    - Always refresh source_verified_at and reset stale_check_count
    - Upgrade apply_url if new source has higher priority
    - Fill salary if missing from existing record
    - Do NOT downgrade source (career_page → jobspy)

    Returns: {"action": "inserted"|"updated"|"skipped", "error": str|None}
    """
    client = get_client()

    title       = (job.get("title") or "").strip()
    company     = (job.get("company_name") or "").strip()
    city        = (job.get("city") or "").strip()
    state       = (job.get("state") or "").strip()
    country     = (job.get("country") or "US").strip()
    source      = job.get("source", "jobspy")

    if not title or not company:
        return {"action": "skipped", "error": "missing title or company"}

    dedup_hash  = compute_dedup_hash(title, company, city, state, country)
    slug        = generate_slug(title, company, city, state)
    expires_at  = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    now         = datetime.now(timezone.utc).isoformat()

    # Build description_summary (200 char truncation)
    description = job.get("description") or ""
    description_summary = (description[:197] + "...") if len(description) > 200 else description

    row = {
        "slug":                slug,
        "title":               title,
        "company_name":        company,
        "description":         description or "See full description on source site.",
        "description_summary": description_summary,
        "apply_url":           job.get("apply_url"),
        "apply_is_direct":     job.get("apply_is_direct", False),
        "source":              source,
        "source_publisher":    job.get("source_publisher") or source,
        "source_job_id":       job.get("source_job_id"),
        "source_url":          job.get("source_url"),
        "vertical":            job.get("vertical", "spa"),
        "role_category":       job.get("role_category", "other"),
        "city":                city or None,
        "state":               state or None,
        "country":             country,
        "salary_min":          job.get("salary_min"),
        "salary_max":          job.get("salary_max"),
        "salary_type":         job.get("salary_type"),
        "salary_currency":     job.get("salary_currency", "USD"),
        "job_type":            job.get("job_type"),
        "is_remote":           bool(job.get("is_remote", False)),
        "employer_logo_url":   job.get("employer_logo_url"),
        "source_verified":     True,
        "source_verified_at":  now,
        "stale_check_count":   0,
        "expires_at":          job.get("expires_at") or expires_at,
        "status":              "active",
        "dedup_hash":          dedup_hash,
    }

    try:
        # Check if job already exists
        existing = client.schema("socelle").table("jobs") \
            .select("id, source, apply_url, salary_min, salary_max") \
            .eq("dedup_hash", dedup_hash) \
            .maybe_single() \
            .execute()

        if existing.data:
            # Job exists — update freshness and conditionally upgrade
            existing_record = existing.data
            existing_source = existing_record.get("source", "")

            update_payload = {
                "source_verified_at": now,
                "stale_check_count":  0,
                "expires_at":         expires_at,
                "updated_at":         now,
            }

            # Upgrade apply_url if new source has higher priority
            if source_priority(source) < source_priority(existing_source):
                update_payload["apply_url"]          = row["apply_url"]
                update_payload["source"]             = source
                update_payload["source_publisher"]   = row["source_publisher"]

            # Fill salary if missing
            if not existing_record.get("salary_min") and row.get("salary_min"):
                update_payload["salary_min"] = row["salary_min"]
                update_payload["salary_max"] = row["salary_max"]
                update_payload["salary_type"] = row["salary_type"]

            client.schema("socelle").table("jobs") \
                .update(update_payload) \
                .eq("dedup_hash", dedup_hash) \
                .execute()

            return {"action": "updated", "slug": slug, "error": None}

        else:
            # New job — insert
            client.schema("socelle").table("jobs").insert(row).execute()
            return {"action": "inserted", "slug": slug, "error": None}

    except Exception as e:
        log_error("dedup.upsert_job", f"{title} @ {company}", str(e))
        return {"action": "skipped", "error": str(e)}
