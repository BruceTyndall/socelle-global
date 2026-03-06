"""
main.py — Socelle Jobs Pipeline Entrypoint

Dispatches to the correct agent based on CLI argument.

Usage:
  python main.py jobspy    # Agent J1 — runs every 6h
  python main.py careers   # Agent J2 — runs weekly Monday
  python main.py niche     # Agent J3 — runs weekly Wednesday
  python main.py cleanup   # Agent J4 — runs every 6h

Railway cron.json handles scheduling. Procfile starts jobspy as the default worker.
"""

import sys
from utils.supabase_client import get_client


def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py [jobspy|careers|niche|cleanup]")
        print("Running jobspy by default…")
        command = "jobspy"
    else:
        command = sys.argv[1].lower().strip()

    client = get_client()
    print(f"[main] Running agent: {command}")

    if command == "jobspy":
        from agents.jobspy_scraper import run
        stats = run(client)

    elif command == "careers":
        from agents.career_pages import run
        stats = run(client)

    elif command == "niche":
        from agents.niche_boards import run
        stats = run(client)

    elif command == "cleanup":
        from agents.cleanup import run
        stats = run(client)

    else:
        print(f"[main] Unknown command: {command}")
        print("Valid commands: jobspy, careers, niche, cleanup")
        sys.exit(1)

    print(f"[main] Finished: {stats}")


if __name__ == "__main__":
    main()
