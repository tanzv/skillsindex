import { createServer } from "node:net";

import { afterEach, describe, expect, it } from "vitest";

import { findAvailablePort } from "./runtime.mjs";

const openServers = [];

async function listenOnRandomPort() {
  const server = createServer();
  openServers.push(server);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected TCP server address");
  }

  return address.port;
}

afterEach(async () => {
  await Promise.all(
    openServers.splice(0).map(
      (server) =>
        new Promise((resolve) => {
          server.close(() => resolve());
        })
    )
  );
});

describe("findAvailablePort", () => {
  it("returns the preferred port when it is free", async () => {
    const freePort = await listenOnRandomPort();
    await new Promise((resolve) => {
      openServers[0].close(() => resolve());
    });
    openServers.length = 0;

    const resolvedPort = await findAvailablePort("127.0.0.1", freePort);

    expect(resolvedPort).toBe(freePort);
  });

  it("falls back to another free port when the preferred port is occupied", async () => {
    const occupiedPort = await listenOnRandomPort();

    const resolvedPort = await findAvailablePort("127.0.0.1", occupiedPort);

    expect(resolvedPort).not.toBe(occupiedPort);
    expect(resolvedPort).toBeGreaterThan(0);
  });
});
