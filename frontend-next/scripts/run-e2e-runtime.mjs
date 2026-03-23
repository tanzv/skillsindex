const externalBackendFlagNames = [
  "PLAYWRIGHT_USE_EXTERNAL_BACKEND",
  "PLAYWRIGHT_SKIP_MOCK_BACKEND",
];

const externalBackendBaseURLEnvNames = [
  "PLAYWRIGHT_BACKEND_BASE_URL",
  "SKILLSINDEX_SERVER_API_BASE_URL",
  "NEXT_PUBLIC_API_BASE_URL",
];

export function resolveDefaultPort(base, processId = process.pid) {
  return base + (processId % 1000);
}

function resolveFirstConfiguredEnv(env, keys) {
  for (const key of keys) {
    const value = String(env[key] || "").trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function parsePortFromURL(baseURL) {
  try {
    const url = new URL(baseURL);
    if (url.port) {
      return Number(url.port);
    }

    if (url.protocol === "https:") {
      return 443;
    }

    if (url.protocol === "http:") {
      return 80;
    }
  } catch {
    return null;
  }

  return null;
}

function isExternalBackendEnabled(env) {
  return externalBackendFlagNames.some(
    (key) => String(env[key] || "").trim() === "1",
  );
}

export function resolveE2ERuntimeOptions({
  env = process.env,
  buildMetadata = null,
  hasBuildOutput = false,
  processId = process.pid,
} = {}) {
  const requestedBuildReuse =
    String(env.PLAYWRIGHT_SKIP_BUILD || "").trim() === "1";
  const skipFreshBuild =
    requestedBuildReuse && hasBuildOutput && buildMetadata !== null;
  const frontendPort = Number(
    env.PLAYWRIGHT_FRONTEND_PORT || resolveDefaultPort(33200, processId),
  );
  const frontendBaseURL = `http://127.0.0.1:${frontendPort}`;
  const useExternalBackend = isExternalBackendEnabled(env);

  if (useExternalBackend) {
    const backendBaseURL = resolveFirstConfiguredEnv(
      env,
      externalBackendBaseURLEnvNames,
    );

    if (!backendBaseURL) {
      throw new Error(
        "PLAYWRIGHT_BACKEND_BASE_URL must be set when PLAYWRIGHT_USE_EXTERNAL_BACKEND=1",
      );
    }

    return {
      requestedBuildReuse,
      skipFreshBuild,
      useExternalBackend: true,
      shouldStartMockBackend: false,
      backendPort: parsePortFromURL(backendBaseURL),
      backendBaseURL,
      frontendPort,
      frontendBaseURL,
    };
  }

  const backendPort = Number(
    env.PLAYWRIGHT_BACKEND_PORT ||
      buildMetadata?.backendPort ||
      resolveDefaultPort(34200, processId),
  );
  const backendBaseURL = `http://127.0.0.1:${backendPort}`;

  return {
    requestedBuildReuse,
    skipFreshBuild,
    useExternalBackend: false,
    shouldStartMockBackend: true,
    backendPort,
    backendBaseURL,
    frontendPort,
    frontendBaseURL,
  };
}
