#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import subprocess
from functools import lru_cache
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class LcodeProfileSpec:
    name: str
    runtime: str
    entry: str
    cwd: str
    args: tuple[str, ...]
    managed: bool
    mode: str
    log_retention: str
    env: dict[str, str]
    prelaunch_task: str | None
    poststop_task: str | None


def repository_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _resolve_string_template(value: str, variables: dict[str, str]) -> str:
    resolved = value
    for key, replacement in variables.items():
        resolved = resolved.replace(f"${{{key}}}", replacement)
    return resolved


def _resolve_template_node(value: Any, variables: dict[str, str]) -> Any:
    if isinstance(value, str):
        return _resolve_string_template(value, variables)
    if isinstance(value, list):
        return [_resolve_template_node(item, variables) for item in value]
    if isinstance(value, dict):
        return {key: _resolve_template_node(item, variables) for key, item in value.items()}
    return value


def load_profile_specs(repo_root: Path) -> dict[str, LcodeProfileSpec]:
    config_path = repo_root / "scripts" / "dev" / "lcode_profiles.json"
    payload = json.loads(config_path.read_text(encoding="utf8"))
    defaults = {
        key: str(value)
        for key, value in dict(payload.get("defaults", {})).items()
    }
    profiles = payload.get("profiles", {})
    specs: dict[str, LcodeProfileSpec] = {}
    for name, raw_profile in profiles.items():
        resolved_profile = _resolve_template_node(raw_profile, defaults)
        specs[name] = LcodeProfileSpec(
            name=resolved_profile["name"],
            runtime=resolved_profile["runtime"],
            entry=resolved_profile["entry"],
            cwd=resolved_profile["cwd"],
            args=tuple(resolved_profile.get("args", [])),
            managed=bool(resolved_profile.get("managed", True)),
            mode=resolved_profile.get("mode", "run"),
            log_retention=resolved_profile.get("log_retention", "temporary"),
            env=dict(resolved_profile.get("env", {})),
            prelaunch_task=resolved_profile.get("prelaunch_task"),
            poststop_task=resolved_profile.get("poststop_task"),
        )
    return specs


def _profile_matches_contract(saved_profile: dict[str, Any], expected_spec: LcodeProfileSpec) -> bool:
    comparable_fields = (
        ("runtime", expected_spec.runtime),
        ("entry", expected_spec.entry),
        ("cwd", expected_spec.cwd),
        ("args", list(expected_spec.args)),
        ("managed", expected_spec.managed),
        ("mode", expected_spec.mode),
        ("env", expected_spec.env),
        ("prelaunch_task", expected_spec.prelaunch_task),
        ("poststop_task", expected_spec.poststop_task),
    )
    for field_name, expected_value in comparable_fields:
        if saved_profile.get(field_name) != expected_value:
            return False

    # Older lcode builds do not persist or report log retention. Treat absence as compatible.
    if "log_retention" in saved_profile and saved_profile.get("log_retention") != expected_spec.log_retention:
        return False

    return True


def _load_saved_profile(repo_root: Path, profile_name: str) -> dict[str, Any] | None:
    result = subprocess.run(
        ["lcode", "config", "show", "--name", profile_name, "--json"],
        cwd=repo_root,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return None

    payload = json.loads(result.stdout)
    profile = payload.get("profile")
    if not isinstance(profile, dict):
        return None
    return profile


@lru_cache(maxsize=1)
def _supports_log_retention(repo_root: Path) -> bool:
    result = subprocess.run(
        ["lcode", "config", "save", "--help"],
        cwd=repo_root,
        check=True,
        capture_output=True,
        text=True,
    )
    return "--log-retention" in result.stdout


def _save_profile(repo_root: Path, spec: LcodeProfileSpec) -> None:
    command = [
        "lcode",
        "config",
        "save",
        "--name",
        spec.name,
        "--runtime",
        spec.runtime,
        "--entry",
        spec.entry,
        "--cwd",
        spec.cwd,
        "--mode",
        spec.mode,
    ]

    if _supports_log_retention(repo_root):
        command.extend(["--log-retention", spec.log_retention])

    if spec.managed:
        command.append("--managed")

    for arg in spec.args:
        command.append(f"--arg={arg}")

    for key, value in spec.env.items():
        command.extend(["--env", f"{key}={value}"])

    if spec.prelaunch_task:
        command.extend(["--prelaunch-task", spec.prelaunch_task])

    if spec.poststop_task:
        command.extend(["--poststop-task", spec.poststop_task])

    subprocess.run(command, cwd=repo_root, check=True)


def ensure_profiles(repo_root: Path, selected_names: list[str] | None = None) -> None:
    specs = load_profile_specs(repo_root)
    names = selected_names if selected_names is not None else sorted(specs.keys())
    for name in names:
        if name not in specs:
            raise SystemExit(f"Unknown lcode profile contract: {name}")
        saved_profile = _load_saved_profile(repo_root, name)
        if saved_profile is not None and _profile_matches_contract(saved_profile, specs[name]):
            continue
        _save_profile(repo_root, specs[name])


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Synchronize repository lcode profile contracts into local lcode state.",
    )
    parser.add_argument(
        "--name",
        action="append",
        dest="names",
        help="Profile name to synchronize. Repeat for multiple profiles.",
    )
    args = parser.parse_args()

    ensure_profiles(repository_root(), args.names)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
