import { once } from "node:events";
import net from "node:net";

function normalizePreferredPort(port) {
  const parsed = Number.parseInt(String(port || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

async function claimPort(host, port) {
  const server = net.createServer();
  server.unref();

  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, host, () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to resolve a TCP port for visual preview");
    }

    return address.port;
  } finally {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  }
}

export async function findAvailablePort(host, preferredPort) {
  const normalizedPreferredPort = normalizePreferredPort(preferredPort);
  if (normalizedPreferredPort > 0) {
    try {
      return await claimPort(host, normalizedPreferredPort);
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : "";
      if (code !== "EADDRINUSE" && code !== "EACCES") {
        throw error;
      }
    }
  }

  return claimPort(host, 0);
}

export async function terminateChildProcess(childProcess) {
  if (!childProcess || childProcess.exitCode !== null || childProcess.killed) {
    return;
  }

  childProcess.kill("SIGTERM");
  await once(childProcess, "exit");
}
