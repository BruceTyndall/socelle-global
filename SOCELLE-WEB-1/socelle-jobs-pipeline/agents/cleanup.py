"""
agents/cleanup.py — Agent J4: Stale job verification + expiration.

Schedule: Every 6 hours (Railway cron, runs after J1)
Purpose: Remove stale listings. Jobs not re-verified in 72h (3 x 24h cycles) are expired.
Direct-posted jobs (source='direct_post') are NEVER touched by cleanup.
"""

from utils.supabase_client import get_client
from utils.logger import log_ingestion, log_error
from utils.google_indexing import notify_expired_jobs


def run(client=None) -> dict:
    """Run all 4 cleanup RPC functions in order. Returns stats dict."""
    if client is None:
        client = get_client()

    stats = {
        "stale_incremented": 0,
        "expired": 0,
        "past_date_expired": 0,
        "archived": 0,
        "google_deindexed": 0,
        "errors": 0,
    }

    # 1. Increment stale_check_count for jobs not re-verified in 24h
    try:
        result = client.rpc("increment_stale_jobs").execute()
        count = result.data if isinstance(result.data, int) else 0
        stats["stale_incremented"] = count
        print(f"[J4] Stale incremented: {count}")
    except Exception as e:
        log_error("cleanup", "increment_stale_jobs", str(e))
        stats["errors"] += 1

    # 2. Expire jobs with stale_check_count >= 3 (missed 3 consecutive 24h cycles)
    try:
        result = client.rpc("expire_stale_jobs").execute()
        count = result.data if isinstance(result.data, int) else 0
        stats["expired"] = count
        print(f"[J4] Expired (stale): {count}")
    except Exception as e:
        log_error("cleanup", "expire_stale_jobs", str(e))
        stats["errors"] += 1

    # 3. Expire any job past its expires_at date
    try:
        result = client.rpc("expire_past_date").execute()
        count = result.data if isinstance(result.data, int) else 0
        stats["past_date_expired"] = count
        print(f"[J4] Expired (past date): {count}")
    except Exception as e:
        log_error("cleanup", "expire_past_date", str(e))
        stats["errors"] += 1

    # 3b. Notify Google to de-index freshly expired jobs (slugs only)
    try:
        expired_rows = (
            client.schema("socelle")
            .from_("jobs")
            .select("slug")
            .eq("status", "expired")
            .is_("source_verified_at", "null")  # only jobs that just expired (not yet notified)
            .limit(180)
            .execute()
        )
        expired_slugs = [r["slug"] for r in (expired_rows.data or []) if r.get("slug")]
        if expired_slugs:
            gindex = notify_expired_jobs(expired_slugs)
            stats["google_deindexed"] = gindex["sent"]
            print(f"[J4] Google de-indexed: {gindex}")
    except Exception as e:
        log_error("cleanup", "google_deindex", str(e))
        stats["errors"] += 1

    # 4. Archive expired jobs older than 90 days
    try:
        result = client.rpc("archive_old_jobs").execute()
        count = result.data if isinstance(result.data, int) else 0
        stats["archived"] = count
        print(f"[J4] Archived: {count}")
    except Exception as e:
        log_error("cleanup", "archive_old_jobs", str(e))
        stats["errors"] += 1

    log_ingestion(
        source="cleanup",
        status="success" if stats["errors"] == 0 else "partial",
        records_updated=stats["expired"] + stats["past_date_expired"],
        records_failed=stats["errors"],
        metadata=stats,
    )

    print(f"[J4] Done: {stats}")
    return stats
