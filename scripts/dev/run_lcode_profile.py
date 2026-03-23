#!/usr/bin/env python3

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any


def _load_running_sessions(repo_root: Path) -> list[dict[str, Any]]:
    result = subprocess.run(
        ["lcode", "running", "--json"],
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)
    items = payload.get("items", [])
    sessions: list[dict[str, Any]] = []
    for item in items:
        if item.get("link_path") != str(repo_root):
            continue
        if item.get("status") != "running":
            continue
        sessions.append(item)
    return sessions


def _find_running_session(repo_root: Path, profile_name: str) -> dict[str, Any] | None:
    for item in _load_running_sessions(repo_root):
        if item.get("name") == profile_name:
            return item
    return None


def _print_existing_session(session: dict[str, Any]) -> None:
    session_id = session.get("id", "unknown")
    pid = session.get("pid", "unknown")
    print(f"Session already running: name={session.get('name')} id={session_id} pid={pid}")


def _start_profile(profile_name: str) -> int:
    result = subprocess.run(["lcode", "config", "run", "--name", profile_name])
    return result.returncode


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Usage: run_lcode_profile.py <profile_name>", file=sys.stderr)
        return 1

    profile_name = argv[1]
    repo_root = Path(__file__).resolve().parents[2]
    existing_session = _find_running_session(repo_root, profile_name)
    if existing_session is not None:
        _print_existing_session(existing_session)
        return 0

    return _start_profile(profile_name)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
