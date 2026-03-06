"""
google_indexing.py — Google Indexing API notifier

Pings Google to index or de-index job detail pages when they go live or expire.

Requires:
- GOOGLE_INDEXING_SA_JSON: service account JSON key (entire file contents as env var)
- google-auth package

Setup:
1. Create a Google Cloud project
2. Enable the "Indexing API"
3. Create a service account + download JSON key
4. Add the service account email as an owner in Google Search Console
5. Set GOOGLE_INDEXING_SA_JSON env var on Railway

Reference: https://developers.google.com/search/apis/indexing-api/v3/quickstart
"""

import json
import os
import time
from typing import Literal

try:
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request as GoogleRequest
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False

INDEXING_SCOPES = ['https://www.googleapis.com/auth/indexing']
INDEXING_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
BASE_URL = 'https://socelle.com/jobs'

# Rate limit: 200 requests/day, batch in groups
BATCH_DELAY_SECONDS = 0.25
MAX_DAILY_NOTIFICATIONS = 180  # leave headroom below 200 limit


def _get_credentials():
    """Build Google service account credentials from env var."""
    sa_json = os.environ.get('GOOGLE_INDEXING_SA_JSON')
    if not sa_json:
        return None
    try:
        info = json.loads(sa_json)
        return service_account.Credentials.from_service_account_info(
            info, scopes=INDEXING_SCOPES
        )
    except Exception as e:
        print(f'[google_indexing] credential error: {e}')
        return None


def notify_urls(slugs: list[str], notification_type: Literal['URL_UPDATED', 'URL_DELETED']) -> dict:
    """
    Notify Google Indexing API for a batch of job slugs.

    Args:
        slugs: list of job slugs (without base URL)
        notification_type: 'URL_UPDATED' for new/updated jobs, 'URL_DELETED' for expired/removed

    Returns:
        dict with keys: sent, skipped, errors
    """
    if not GOOGLE_AUTH_AVAILABLE:
        print('[google_indexing] google-auth not installed — skipping')
        return {'sent': 0, 'skipped': len(slugs), 'errors': 0}

    if not slugs:
        return {'sent': 0, 'skipped': 0, 'errors': 0}

    creds = _get_credentials()
    if creds is None:
        print('[google_indexing] no credentials — skipping')
        return {'sent': 0, 'skipped': len(slugs), 'errors': 0}

    import urllib.request

    # Refresh token
    creds.refresh(GoogleRequest())
    token = creds.token

    sent = 0
    errors = 0
    batch = slugs[:MAX_DAILY_NOTIFICATIONS]
    skipped = len(slugs) - len(batch)

    for slug in batch:
        url = f'{BASE_URL}/{slug}'
        payload = json.dumps({'url': url, 'type': notification_type}).encode()
        req = urllib.request.Request(
            INDEXING_ENDPOINT,
            data=payload,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    sent += 1
                else:
                    errors += 1
                    print(f'[google_indexing] non-200 for {slug}: {resp.status}')
        except Exception as e:
            errors += 1
            print(f'[google_indexing] error for {slug}: {e}')

        time.sleep(BATCH_DELAY_SECONDS)

    return {'sent': sent, 'skipped': skipped, 'errors': errors}


def notify_new_jobs(slugs: list[str]) -> dict:
    """Notify Google that new job pages are available for indexing."""
    return notify_urls(slugs, 'URL_UPDATED')


def notify_expired_jobs(slugs: list[str]) -> dict:
    """Notify Google to de-index expired job pages."""
    return notify_urls(slugs, 'URL_DELETED')
