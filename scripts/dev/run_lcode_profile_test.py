#!/usr/bin/env python3

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path
from subprocess import CompletedProcess
from unittest.mock import patch

SCRIPT_DIRECTORY = Path(__file__).resolve().parent
if str(SCRIPT_DIRECTORY) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIRECTORY))

from ensure_lcode_profiles import LcodeProfileSpec
from run_lcode_profile import (
    _assert_runtime_guard,
    _collect_process_tree_pids,
    _has_artifact_drift,
    _session_matches_contract,
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

    @patch("run_lcode_profile._find_unmanaged_repo_processes", return_value=[])
    @patch("run_lcode_profile._load_process_command", return_value="node next-server")
    @patch("run_lcode_profile._find_listening_pids", return_value=[16593])
    @patch("run_lcode_profile._resolve_listen_port", return_value=3400)
    def test_port_guard_rejects_other_repo_lcode_sessions_on_same_port(
        self,
        _resolve_listen_port: object,
        _find_listening_pids: object,
        _load_process_command: object,
        _find_unmanaged_repo_processes: object,
    ) -> None:
        expected_spec = make_profile_spec()

        with self.assertRaises(SystemExit) as context:
            _assert_runtime_guard(
                Path("/tmp/skillsindex"),
                "skillsindex-frontend",
                expected_spec,
                allowed_process_pids={16593},
                allowed_listen_pids=set(),
            )

        self.assertIn("Port conflict detected", str(context.exception))


class RuntimeArtifactDriftTest(unittest.TestCase):
    def test_detects_frontend_build_artifacts_newer_than_running_session(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            repo_root = Path(temporary_directory)
            build_manifest = repo_root / "frontend-next" / ".next" / "build-manifest.json"
            build_manifest.parent.mkdir(parents=True, exist_ok=True)
            build_manifest.write_text("{}", encoding="utf8")

            session = {
                "created_at": 100,
                "updated_at": 100,
            }

            with patch("run_lcode_profile.Path.stat") as mocked_stat:
                mocked_stat.return_value.st_mtime = 150
                self.assertTrue(_has_artifact_drift(repo_root, "skillsindex-frontend", session))

    def test_ignores_profiles_without_runtime_artifact_contract(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            repo_root = Path(temporary_directory)
            session = {
                "created_at": 100,
                "updated_at": 100,
            }

            self.assertFalse(_has_artifact_drift(repo_root, "skillsindex-backend", session))


if __name__ == "__main__":
    unittest.main()
