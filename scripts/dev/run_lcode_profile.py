#!/usr/bin/env python3

from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ensure_lcode_profiles import LcodeProfileSpec, ensure_profiles, load_profile_specs


@dataclass(frozen=True)
class RuntimeGuard:
    profile_name: str
    service_label: str
    listen_port: int
    prohibited_commands: tuple[str, ...]


RUNTIME_GUARDS: dict[str, RuntimeGuard] = {
    "skillsindex-frontend": RuntimeGuard(
        profile_name="skillsindex-frontend",
        service_label="frontend",
        listen_port=3000,
        prohibited_commands=("npm run dev", "next dev", "next start"),
    ),
    "skillsindex-backend": RuntimeGuard(
        profile_name="skillsindex-backend",
        service_label="backend",
        listen_port=8080,
        prohibited_commands=("go run ./cmd/server", "go run ./cmd/api"),
    ),
}


def _repository_root() -> Path:
    return Path(__file__).resolve().parents[2]


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


def _print_runtime_policy(profile_name: str) -> None:
    guard = RUNTIME_GUARDS.get(profile_name)
    print(f"Runtime policy: {profile_name} must be started via lcode or make dev*.")
    if guard is None:
        return
    prohibited = ", ".join(guard.prohibited_commands)
    print(f"Do not keep the repository {guard.service_label} alive with unmanaged commands such as {prohibited}.")


def _load_session_spec(session_id: str) -> dict[str, Any]:
    result = subprocess.run(
        ["lcode", "inspect", session_id, "--tail", "0", "--json"],
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)
    return payload["session"]["spec"]


def _session_matches_contract(session_spec: dict[str, Any], expected_spec: LcodeProfileSpec) -> bool:
    comparable_fields = (
        ("runtime", expected_spec.runtime),
        ("entry", expected_spec.entry),
        ("cwd", expected_spec.cwd),
        ("args", list(expected_spec.args)),
        ("managed", expected_spec.managed),
        ("mode", expected_spec.mode),
        ("prelaunch_task", expected_spec.prelaunch_task),
        ("poststop_task", expected_spec.poststop_task),
    )
    for field_name, expected_value in comparable_fields:
        if session_spec.get(field_name) != expected_value:
            return False
    return True


def _stop_session(session_id: str) -> None:
    subprocess.run(["lcode", "stop", session_id, "--json"], check=True)


def _load_process_command(pid: int) -> str:
    result = subprocess.run(
        ["ps", "-o", "command=", "-p", str(pid)],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def _load_process_cwd(pid: int) -> str | None:
    result = subprocess.run(
        ["lsof", "-a", "-p", str(pid), "-d", "cwd", "-Fn"],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode not in (0, 1):
        return None
    for line in result.stdout.splitlines():
        if line.startswith("n"):
            return line[1:].strip()
    return None


def _find_listening_pids(port: int) -> list[int]:
    result = subprocess.run(
        ["lsof", "-tiTCP:{port}".format(port=port), "-sTCP:LISTEN"],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode not in (0, 1):
        raise RuntimeError(f"Unable to inspect listening processes on port {port}.")
    pids: list[int] = []
    for line in result.stdout.splitlines():
        value = line.strip()
        if not value:
            continue
        pids.append(int(value))
    return pids


def _collect_allowed_lcode_pids(repo_root: Path) -> set[int]:
    allowed_pids: set[int] = set()
    for session in _load_running_sessions(repo_root):
        pid = session.get("pid")
        if isinstance(pid, int):
            allowed_pids.add(pid)
    return allowed_pids


def _find_unmanaged_repo_processes(
    repo_root: Path,
    profile_name: str,
    allowed_pids: set[int],
) -> list[tuple[int, str]]:
    guard = RUNTIME_GUARDS.get(profile_name)
    if guard is None:
        return []

    repo_root_str = str(repo_root)
    matches: list[tuple[int, str]] = []
    seen_pids: set[int] = set()
    result = subprocess.run(
        ["pgrep", "-af", guard.service_label],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode not in (0, 1):
        return []

    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        pid_str, _, command = line.partition(" ")
        if not pid_str.isdigit():
            continue
        pid = int(pid_str)
        if pid in allowed_pids or pid in seen_pids:
            continue
        process_cwd = _load_process_cwd(pid)
        if process_cwd is None or not process_cwd.startswith(repo_root_str):
            continue
        normalized_command = command.strip()
        if any(token in normalized_command for token in guard.prohibited_commands):
            matches.append((pid, normalized_command))
            seen_pids.add(pid)
    return matches


def _assert_runtime_guard(
    repo_root: Path,
    profile_name: str,
    allowed_pids: set[int] | None = None,
) -> None:
    guard = RUNTIME_GUARDS.get(profile_name)
    if guard is None:
        return

    allowed = allowed_pids or set()
    port_pids = _find_listening_pids(guard.listen_port)
    conflicting_pids = [pid for pid in port_pids if pid not in allowed]
    if conflicting_pids:
        pid = conflicting_pids[0]
        command = _load_process_command(pid)
        raise SystemExit(
            "\n".join(
                [
                    f"Port conflict detected for {profile_name}: port {guard.listen_port} is already in use.",
                    f"Conflicting pid={pid} command={command}",
                    "Repository services must be managed through lcode or make dev*.",
                    f"Stop the conflicting process and retry: lcode stop <session_id> --json or kill {pid}",
                ]
            )
        )

    unmanaged_processes = _find_unmanaged_repo_processes(repo_root, profile_name, allowed)
    if unmanaged_processes:
        pid, command = unmanaged_processes[0]
        raise SystemExit(
            "\n".join(
                [
                    f"Unmanaged repository runtime detected for {profile_name}.",
                    f"Conflicting pid={pid} command={command}",
                    f"Allowed entrypoints: lcode config run --name {profile_name} or make dev*",
                    "Stop the unmanaged process before continuing so the repository stays under lcode control.",
                ]
            )
        )


def _start_profile(profile_name: str) -> int:
    result = subprocess.run(["lcode", "config", "run", "--name", profile_name])
    return result.returncode


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Usage: run_lcode_profile.py <profile_name>", file=sys.stderr)
        return 1

    profile_name = argv[1]
    repo_root = _repository_root()
    _print_runtime_policy(profile_name)
    ensure_profiles(repo_root, [profile_name])
    profile_specs = load_profile_specs(repo_root)
    expected_spec = profile_specs[profile_name]
    allowed_lcode_pids = _collect_allowed_lcode_pids(repo_root)
    existing_session = _find_running_session(repo_root, profile_name)
    if existing_session is not None:
        session_id = existing_session.get("id")
        if session_id is None:
            print(f"Session {profile_name} is missing an id and cannot be reused.", file=sys.stderr)
            return 1
        session_spec = _load_session_spec(session_id)
        if _session_matches_contract(session_spec, expected_spec):
            session_pid = existing_session.get("pid")
            allowed_for_reuse = set(allowed_lcode_pids)
            if isinstance(session_pid, int):
                allowed_for_reuse.add(session_pid)
            _assert_runtime_guard(repo_root, profile_name, allowed_for_reuse)
            _print_existing_session(existing_session)
            return 0
        print(
            f"Session config drift detected: name={profile_name} id={session_id}. Restarting with repository contract."
        )
        _stop_session(session_id)

    _assert_runtime_guard(repo_root, profile_name, allowed_lcode_pids)
    return _start_profile(profile_name)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
