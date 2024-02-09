import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ColyseusTestServer, boot } from "@colyseus/testing";

import { proxy } from "../src/proxy";

import { GameState, gameConfig, NestedSchema } from "./room";

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

  it("should track the schema's dereferenced properties", async () => {
    const room = await server.createRoom<GameState>("my_room");
    const client = await server.connectTo(room);

    room.state.arrayOfNestedSchemas.push(new NestedSchema());

    await room.waitForNextPatch();

    const path: string[] = [];
    const target = proxy(room.state.toJSON(), path) as GameState;

    target.arrayOfNestedSchemas[0].x;

    expect(path).toEqual(["arrayOfNestedSchemas", "0", "x"]);
  });

  // it("should work LOL", async () => {
  //   const room = await server.createRoom<GameState>("my_room");
  //   const client = await server.connectTo(room);

  //   const Component = () => {
  //     const { useColyseusState } = colyseus(client);
  //     const clients = useColyseusState((s) => s.clients);

  //     console.log(`From component: clients = ${clients}`);

  //     return null;
  //   };

  //   await room.waitForNextPatch();

  //   render(<Component />);

  //   expect(client.state.clients).toBe(1);
  // });
});
