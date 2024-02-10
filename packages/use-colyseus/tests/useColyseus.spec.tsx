import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ColyseusTestServer, boot } from "@colyseus/testing";
import { render, screen } from "@testing-library/react";
import { useEffect } from "react";

import { proxy } from "../src/proxy";
import { colyseus } from "../src/colyseus";

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

    await client.waitForNextPatch();

    expect(client.state.clients).toBe(1);
  });

  it("should track the schema's dereferenced properties", async () => {
    const room = await server.createRoom<GameState>("my_room");
    const client = await server.connectTo(room);

    room.state.arrayOfNestedSchemas.push(new NestedSchema());

    await client.waitForNextPatch();

    const path: string[] = [];
    const target = proxy(room.state.toJSON(), path) as GameState;

    target.arrayOfNestedSchemas[0].x;

    expect(path).toEqual(["arrayOfNestedSchemas", "0", "x"]);
  });

  it("should return deeply nested values", async () => {
    const room = await server.createRoom<GameState>("my_room");
    const client = await server.connectTo(room);

    room.state.arrayOfNestedSchemas.push(new NestedSchema());

    await client.waitForNextPatch();

    const { useColyseusState } = colyseus(client);

    const Component = () => {
      const deepNestedX = useColyseusState((s) => s.arrayOfNestedSchemas[0].x);
      return <div data-testid="deeply-nested-value">{deepNestedX}</div>;
    };

    render(<Component />);

    expect(screen.getByTestId("deeply-nested-value").textContent).toContain(
      "0"
    );
  });

  it("should re-render when schema property update", async () => {
    const room = await server.createRoom<GameState>("my_room");
    const client = await server.connectTo(room);

    // NOTE(pedr0fontoura): We always need to wait for the first patch
    await client.waitForNextPatch();

    const { useColyseusState } = colyseus(client);

    let cachedNetworkTime: number;
    let updatedNetworkTime: number;

    const Component = () => {
      const networkTime = useColyseusState((s) => s.networkTime);

      useEffect(() => {
        cachedNetworkTime = networkTime;
      }, []);

      updatedNetworkTime = networkTime;

      return null;
    };

    render(<Component />);

    await client.waitForNextPatch();

    expect(cachedNetworkTime).not.toBe(updatedNetworkTime);
  });

  it("should return collection items", async () => {
    const room = await server.createRoom<GameState>("my_room");
    const client = await server.connectTo(room);

    room.state.arrayOfNestedSchemas.push(new NestedSchema());

    await client.waitForNextPatch();

    const { useColyseusState } = colyseus(client);

    const Component = () => {
      const arrayOfNestedSchemas = useColyseusState(
        (s) => s.arrayOfNestedSchemas
      );

      return arrayOfNestedSchemas.map((schema) => (
        <div data-testid="collection-item">
          x:{schema.x} y:{schema.y}
        </div>
      ));
    };

    render(<Component />);

    expect(screen.getAllByTestId("collection-item").length).toBe(
      room.state.arrayOfNestedSchemas.length
    );
  });
});
