#!/usr/bin/env python3

from __future__ import annotations

import sys
import unittest
from pathlib import Path
from subprocess import CompletedProcess
from unittest.mock import patch

SCRIPT_DIRECTORY = Path(__file__).resolve().parent
if str(SCRIPT_DIRECTORY) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIRECTORY))

from ensure_lcode_profiles import (
    LcodeProfileSpec,
    _profile_matches_contract,
    _save_profile,
    _supports_log_retention,
    ensure_profiles,
)


def make_profile_spec(**overrides: object) -> LcodeProfileSpec:
    values: dict[str, object] = {
        "name": "skillsindex-frontend",
        "runtime": "node",
        "entry": "node_modules/next/dist/bin/next",
        "cwd": "frontend-next",
        "args": ("start", "--hostname", "127.0.0.1", "--port", "3400"),
        "managed": True,
        "mode": "run",
        "log_retention": "temporary",
        "env": {
            "NEXT_PUBLIC_API_BASE_URL": "http://127.0.0.1:38180",
            "SKILLSINDEX_SERVER_API_BASE_URL": "http://127.0.0.1:38180",
        },
        "prelaunch_task": "npm run build",
        "poststop_task": None,
    }
    values.update(overrides)
    return LcodeProfileSpec(**values)


class SavedProfileContractTest(unittest.TestCase):
    def test_treats_missing_log_retention_as_compatible(self) -> None:
        expected_spec = make_profile_spec()
        saved_profile = {
            "runtime": expected_spec.runtime,
            "entry": expected_spec.entry,
            "cwd": expected_spec.cwd,
            "args": list(expected_spec.args),
            "managed": expected_spec.managed,
            "mode": expected_spec.mode,
            "env": dict(expected_spec.env),
            "prelaunch_task": expected_spec.prelaunch_task,
            "poststop_task": expected_spec.poststop_task,
        }

        self.assertTrue(_profile_matches_contract(saved_profile, expected_spec))


class SaveProfileCompatibilityTest(unittest.TestCase):
    @patch("ensure_lcode_profiles.subprocess.run")
    def test_omits_log_retention_for_older_lcode_clis(self, subprocess_run: object) -> None:
        _supports_log_retention.cache_clear()

        subprocess_run.side_effect = [
            CompletedProcess(
                args=["lcode", "config", "save", "--help"],
                returncode=0,
                stdout="Usage: lcode config save --name <NAME> --runtime <RUNTIME> --entry <ENTRY>\n",
                stderr="",
            ),
            CompletedProcess(args=["lcode", "config", "save"], returncode=0, stdout="", stderr=""),
        ]

        _save_profile(Path("/tmp/repo"), make_profile_spec())

        save_command = subprocess_run.call_args_list[1].args[0]
        self.assertNotIn("--log-retention", save_command)


class EnsureProfilesReuseTest(unittest.TestCase):
    @patch("ensure_lcode_profiles._save_profile")
    @patch("ensure_lcode_profiles._load_saved_profile")
    def test_skips_save_when_existing_profile_matches(self, load_saved_profile: object, save_profile: object) -> None:
        expected_spec = make_profile_spec()
        load_saved_profile.return_value = {
            "runtime": expected_spec.runtime,
            "entry": expected_spec.entry,
            "cwd": expected_spec.cwd,
            "args": list(expected_spec.args),
            "managed": expected_spec.managed,
            "mode": expected_spec.mode,
            "env": dict(expected_spec.env),
            "prelaunch_task": expected_spec.prelaunch_task,
            "poststop_task": expected_spec.poststop_task,
        }

        with patch(
            "ensure_lcode_profiles.load_profile_specs",
            return_value={expected_spec.name: expected_spec},
        ):
            ensure_profiles(Path("/tmp/repo"), [expected_spec.name])

        save_profile.assert_not_called()


if __name__ == "__main__":
    unittest.main()
