"""
utils/logger.py — Ingestion run logging to socelle.ingestion_jobs.
"""

import traceback
from datetime import datetime, timezone
from utils.supabase_client import get_client


def log_ingestion(
    source: str,
    status: str,
    records_fetched: int = 0,
    records_inserted: int = 0,
    records_updated: int = 0,
    records_failed: int = 0,
    metadata: dict | None = None,
) -> None:
    """Write an ingestion run summary to socelle.ingestion_jobs."""
    try:
        client = get_client()
        client.schema("socelle").table("ingestion_jobs").insert({
            "source": source,
            "status": status,
            "records_fetched": records_fetched,
            "records_inserted": records_inserted,
            "records_updated": records_updated,
            "records_failed": records_failed,
            "metadata": metadata or {},
            "started_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception:
        # Logger should never crash the pipeline
        print(f"[logger] Failed to write ingestion log: {traceback.format_exc()}")


def log_error(source: str, context: str, error: str) -> None:
    """Print a structured error — does not write to DB to avoid cascading failures."""
    print(f"[ERROR] source={source} context={context} error={error}")
