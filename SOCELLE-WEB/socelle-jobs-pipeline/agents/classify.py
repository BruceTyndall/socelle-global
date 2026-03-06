"""
agents/classify.py — Beauty job classification.

Returns None if the job is not in the beauty/wellness industry.
Returns the job dict with vertical + role_category added if it is.
"""

from config import BEAUTY_VERTICALS, ROLE_CATEGORIES


def classify_beauty_job(job: dict) -> dict | None:
    """
    Check if a job is beauty-related and classify it.

    Returns:
        dict with 'vertical' and 'role_category' added, or None if not beauty.
    """
    title       = (job.get("title") or "").lower()
    description = (job.get("description") or "")[:2000].lower()  # cap to avoid slow scans
    text        = f"{title} {description}"

    # Must match at least one beauty vertical
    vertical = None
    for v, keywords in BEAUTY_VERTICALS.items():
        if any(kw in text for kw in keywords):
            vertical = v
            break

    # Title-only pass (stronger signal) if no match in full text
    if not vertical:
        for v, keywords in BEAUTY_VERTICALS.items():
            if any(kw in title for kw in keywords):
                vertical = v
                break

    if not vertical:
        return None  # Not beauty — discard

    # Classify role category
    role = "other"
    for r, keywords in ROLE_CATEGORIES.items():
        if any(kw in title for kw in keywords):
            role = r
            break

    # Title match failed — try full text
    if role == "other":
        for r, keywords in ROLE_CATEGORIES.items():
            if any(kw in text for kw in keywords):
                role = r
                break

    job = dict(job)  # don't mutate original
    job["vertical"]      = vertical
    job["role_category"] = role
    return job
