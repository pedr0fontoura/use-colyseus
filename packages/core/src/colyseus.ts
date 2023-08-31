import { Client, Room, ErrorCode } from "colyseus.js";
import { Schema } from "@colyseus/schema";

import { store } from "./store";

type SchemaConstructor<T extends Schema> = new (...args: any[]) => T;

type Colyseus = {
  room: Room | undefined;
  errorCode: ErrorCode | undefined;
};

const COLYSEUS_URL = "ws://localhost:2567";

const client = new Client(COLYSEUS_URL);

export const colyseusStore = store<Colyseus>({
  room: undefined,
  errorCode: undefined,
});
export const stateStore = store<Schema | undefined>(undefined);

let connecting = false;

export async function connectToColyseus<S extends Schema>(
  roomName: string,
  options?: unknown,
  rootSchema?: SchemaConstructor<S>
) {
  if (connecting) return;
  connecting = true;

  try {
    const room = await client.joinOrCreate(roomName, options, rootSchema);
    colyseusStore.set({ room, errorCode: undefined });

    room.onError((errorCode) => {
      colyseusStore.set({ room, errorCode });
    });

    room.onStateChange((state) => {
      stateStore.set(state);
    });

    console.log(`Succesfully connected to Colyseus room at ${COLYSEUS_URL}`);

    return room;
  } catch {
    console.error("Failed to connect to Colyseus!");
  } finally {
    connecting = false;
  }
}

export async function disconnectFromColyseus() {
  const { room } = colyseusStore.get();
  if (!room) return;
  colyseusStore.set({ room: undefined, errorCode: undefined });
  stateStore.set(undefined);
  await room.leave();
}
