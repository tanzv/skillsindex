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

from ensure_lcode_profiles import LcodeProfileSpec
from run_lcode_profile import _collect_process_tree_pids, _session_matches_contract


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


class SessionContractMatchTest(unittest.TestCase):
    def test_detects_environment_drift(self) -> None:
        expected_spec = make_profile_spec()
        session_spec = {
            "runtime": expected_spec.runtime,
            "entry": expected_spec.entry,
            "cwd": expected_spec.cwd,
            "args": list(expected_spec.args),
            "managed": expected_spec.managed,
            "mode": expected_spec.mode,
            "log_retention": expected_spec.log_retention,
            "env": {
                "NEXT_PUBLIC_API_BASE_URL": "http://127.0.0.1:18080",
                "SKILLSINDEX_SERVER_API_BASE_URL": "http://127.0.0.1:18080",
            },
            "prelaunch_task": expected_spec.prelaunch_task,
            "poststop_task": expected_spec.poststop_task,
        }

        self.assertFalse(_session_matches_contract(session_spec, expected_spec))

    def test_detects_log_retention_drift(self) -> None:
        expected_spec = make_profile_spec()
        session_spec = {
            "runtime": expected_spec.runtime,
            "entry": expected_spec.entry,
            "cwd": expected_spec.cwd,
            "args": list(expected_spec.args),
            "managed": expected_spec.managed,
            "mode": expected_spec.mode,
            "log_retention": "persistent",
            "env": dict(expected_spec.env),
            "prelaunch_task": expected_spec.prelaunch_task,
            "poststop_task": expected_spec.poststop_task,
        }

        self.assertFalse(_session_matches_contract(session_spec, expected_spec))


class RuntimeGuardProcessTreeTest(unittest.TestCase):
    @patch("run_lcode_profile.subprocess.run")
    def test_collects_descendant_processes_for_guard_allowlist(self, subprocess_run: object) -> None:
        subprocess_run.side_effect = [
            CompletedProcess(args=["pgrep", "-P", "78315"], returncode=0, stdout="78501\n78502\n", stderr=""),
            CompletedProcess(args=["pgrep", "-P", "78502"], returncode=0, stdout="78503\n", stderr=""),
            CompletedProcess(args=["pgrep", "-P", "78503"], returncode=1, stdout="", stderr=""),
            CompletedProcess(args=["pgrep", "-P", "78501"], returncode=1, stdout="", stderr=""),
        ]

        self.assertEqual(
            _collect_process_tree_pids(78315),
            {78315, 78501, 78502, 78503},
        )


if __name__ == "__main__":
    unittest.main()
