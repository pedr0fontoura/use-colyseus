import { Schema } from "@colyseus/schema";
import { type Room } from "colyseus.js";
import { useSyncExternalStore } from "react";

import { proxy } from "./proxy";

export const colyseus = <S extends Schema>(room: Room<S>) => {
  function useColyseusState(): S | undefined;
  function useColyseusState<T extends (state: S) => unknown>(
    selector: T
  ): ReturnType<T> | undefined;
  function useColyseusState<T extends (state: S) => unknown>(selector?: T) {
    const path: string[] = [];

    if (selector) {
      // NOTE(pedr0fontoura): .toJSON works like a charm here, because we just need to know the path to the property the user is accessing
      selector(proxy(room.state.toJSON(), path) as S);
    }

    if (path.length < 1) {
      const subscribe = (callback: () => void) =>
        room.state.onChange(() => callback());
      const getSnapshot = () => room.state.clone();
      return useSyncExternalStore(subscribe, getSnapshot);
    }

    // TODO(pedr0fontoura): Attach the appropriate listener(s) depending on the accessed property
    let value: any = room.state;

    for (let i = 0; i < path.length; i++) {
      // If this is the last accessed property
      if (i === path.length - 1) {
      }

      value = value[path[i]];
    }

    const subscribe = (callback: () => void) => {
      callback();
      return () => {};
    };

    const getSnapshot = () => {};

    return useSyncExternalStore(subscribe, getSnapshot);
  }

  return {
    useColyseusState,
  };
};
