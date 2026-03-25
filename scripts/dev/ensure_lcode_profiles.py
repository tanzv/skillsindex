#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import subprocess
from dataclasses import dataclass
from pathlib import Path


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


def load_profile_specs(repo_root: Path) -> dict[str, LcodeProfileSpec]:
    config_path = repo_root / "scripts" / "dev" / "lcode_profiles.json"
    payload = json.loads(config_path.read_text(encoding="utf8"))
    profiles = payload.get("profiles", {})
    specs: dict[str, LcodeProfileSpec] = {}
    for name, raw_profile in profiles.items():
        specs[name] = LcodeProfileSpec(
            name=raw_profile["name"],
            runtime=raw_profile["runtime"],
            entry=raw_profile["entry"],
            cwd=raw_profile["cwd"],
            args=tuple(raw_profile.get("args", [])),
            managed=bool(raw_profile.get("managed", True)),
            mode=raw_profile.get("mode", "run"),
            log_retention=raw_profile.get("log_retention", "temporary"),
            env=dict(raw_profile.get("env", {})),
            prelaunch_task=raw_profile.get("prelaunch_task"),
            poststop_task=raw_profile.get("poststop_task"),
        )
    return specs


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
        "--log-retention",
        spec.log_retention,
    ]

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
