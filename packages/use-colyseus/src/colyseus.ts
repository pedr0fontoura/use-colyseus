import { Schema } from "@colyseus/schema";
import { Client, type Room } from "colyseus.js";
import { useSyncExternalStore } from "react";

import { store } from "./store";

export const colyseus = <S = Schema>(
  endpoint: string,
  schema?: new (...args: unknown[]) => S
) => {
  const client = new Client(endpoint);

  const roomStore = store<Room<S> | undefined>(undefined);
  const stateStore = store<S | undefined>(undefined);

  let connecting = false;

  const connectToColyseus = async (roomName: string, options = {}) => {
    if (connecting || roomStore.get()) return;

    connecting = true;

    try {
      const room = await client.joinOrCreate<S>(roomName, options, schema);

      roomStore.set(room);
      stateStore.set(room.state);

      const updatedCollectionsMap: { [key in keyof S]?: boolean } = {};

      for (const [key, value] of Object.entries(room.state as Schema)) {
        if (
          typeof value !== "object" ||
          !value.clone ||
          !value.onAdd ||
          !value.onRemove
        ) {
          continue;
        }

        updatedCollectionsMap[key as keyof S] = false;

        value.onAdd(() => {
          updatedCollectionsMap[key as keyof S] = true;
        });

        value.onRemove(() => {
          updatedCollectionsMap[key as keyof S] = true;
        });
      }

      room.onStateChange((state) => {
        if (!state) return;

        const copy = { ...state };

        for (const [key, update] of Object.entries(updatedCollectionsMap)) {
          if (!update) continue;

          updatedCollectionsMap[key as keyof S] = false;

          const value = state[key as keyof S] as unknown;

          if ((value as Schema).clone) {
            //@ts-ignore
            copy[key as keyof S] = value.clone();
          }
        }

        stateStore.set(copy);
      });

      console.log(
        `Succesfully connected to Colyseus room ${roomName} at ${endpoint}`
      );
    } catch (e) {
      console.error("Failed to connect to Colyseus!");
      console.log(e);
    } finally {
      connecting = false;
    }
  };

  const disconnectFromColyseus = async () => {
    const room = roomStore.get();
    if (!room) return;

    roomStore.set(undefined);
    stateStore.set(undefined);

    try {
      await room.leave();
      console.log("Disconnected from Colyseus!");
    } catch {}
  };

  const useColyseusRoom = () => {
    const subscribe = (callback: () => void) =>
      roomStore.subscribe(() => callback());

    const getSnapshot = () => {
      const colyseus = roomStore.get();
      return colyseus;
    };

    return useSyncExternalStore(subscribe, getSnapshot);
  };

  function useColyseusState(): S | undefined;
  function useColyseusState<T extends (state: S) => unknown>(
    selector: T
  ): ReturnType<T> | undefined;
  function useColyseusState<T extends (state: S) => unknown>(selector?: T) {
    const subscribe = (callback: () => void) =>
      stateStore.subscribe(() => {
        callback();
      });

    const getSnapshot = () => {
      const state = stateStore.get();
      return state && selector ? selector(state) : state;
    };

    return useSyncExternalStore(subscribe, getSnapshot);
  }

  return {
    client,
    connectToColyseus,
    disconnectFromColyseus,
    useColyseusRoom,
    useColyseusState,
  };
};
