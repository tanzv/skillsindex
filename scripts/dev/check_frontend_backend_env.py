#!/usr/bin/env python3

from __future__ import annotations

import os
import sys
from pathlib import Path

PUBLIC_BACKEND_VAR = "NEXT_PUBLIC_API_BASE_URL"
SERVER_BACKEND_VAR = "SKILLSINDEX_SERVER_API_BASE_URL"
SKIP_CHECK_VAR = "SKILLSINDEX_SKIP_FRONTEND_BACKEND_ENV_CHECK"


def _strip_wrapping_quotes(value: str) -> str:
    normalized = value.strip()
    if len(normalized) >= 2 and normalized[0] == normalized[-1] and normalized[0] in {"'", '"'}:
        return normalized[1:-1].strip()
    return normalized


def _normalize_base_url(value: str | None) -> str:
    return _strip_wrapping_quotes(value or "").rstrip("/")


def _load_env_values(env_path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def _resolve_env_path(argv: list[str]) -> Path:
    if len(argv) > 2:
        raise ValueError("Usage: check_frontend_backend_env.py [frontend_env_path]")
    if len(argv) == 2:
        return Path(argv[1]).expanduser().resolve()
    return Path(__file__).resolve().parents[2] / "frontend-next" / ".env"


def main(argv: list[str]) -> int:
    if os.getenv(SKIP_CHECK_VAR) == "1":
        print(f"Skipped frontend environment alignment check because {SKIP_CHECK_VAR}=1.")
        return 0

    try:
        env_path = _resolve_env_path(argv)
    except ValueError as error:
        print(str(error), file=sys.stderr)
        return 1

    if not env_path.is_file():
        print(f"Missing frontend env file: {env_path}", file=sys.stderr)
        return 1

    values = _load_env_values(env_path)
    public_backend_url = _normalize_base_url(values.get(PUBLIC_BACKEND_VAR))
    server_backend_url = _normalize_base_url(values.get(SERVER_BACKEND_VAR))

    if not public_backend_url:
        print(f"Missing required frontend env key: {PUBLIC_BACKEND_VAR}", file=sys.stderr)
        return 1

    if not server_backend_url:
        print(
            f"Missing required frontend env key: {SERVER_BACKEND_VAR}. "
            f"Set it to the same backend origin as {PUBLIC_BACKEND_VAR}.",
            file=sys.stderr,
        )
        return 1

    if public_backend_url != server_backend_url:
        print(
            f"Frontend backend env mismatch: {PUBLIC_BACKEND_VAR}={public_backend_url} "
            f"but {SERVER_BACKEND_VAR}={server_backend_url}.",
            file=sys.stderr,
        )
        return 1

    print(
        "Frontend backend env alignment check passed: "
        f"{PUBLIC_BACKEND_VAR} and {SERVER_BACKEND_VAR} both target {public_backend_url}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
