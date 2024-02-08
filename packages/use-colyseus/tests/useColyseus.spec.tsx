import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ColyseusTestServer, boot } from "@colyseus/testing";

import { GameState, gameConfig } from "./room";

describe("useColyseus hook", () => {
  let server: ColyseusTestServer;

  beforeAll(async () => {
    server = await boot(gameConfig, 2567);
  });
  afterAll(async () => {
    await server.shutdown();
  });

  beforeEach(async () => {
    await server.cleanup();
  });

  it("should update the number of clients", async () => {
    const room = await server.createRoom<GameState>("my_room");

    const client = await server.connectTo(room);

    await room.waitForNextPatch();

    expect(client.state.clients).toBe(1);
  });
});
