import { ArraySchema, MapSchema, Schema, SetSchema } from "@colyseus/schema";
import { type Room } from "colyseus.js";
import { useSyncExternalStore } from "react";

import { proxy } from "./proxy";
import {
  isArraySchema,
  isItemCollection,
  isMapSchema,
  isSchema,
  isSetSchema,
} from "./utils";

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

    // TODO(pedr0fontoura): Cache snapshot value
    const getSnapshot = () => {
      let snapshot: any = room.state;

      for (let i = 0; i < path.length; i++) {
        snapshot = snapshot[path[i]];
      }

      if (isSchema(snapshot)) {
        return snapshot.clone();
      }

      if (
        isArraySchema(snapshot) ||
        isSetSchema(snapshot) ||
        isMapSchema(snapshot)
      ) {
        return snapshot.clone();
      }

      return snapshot;
    };

    let parent: any;
    let key: string;
    let value: any = room.state;

    for (let i = 0; i < path.length; i++) {
      parent = value;
      key = path[i];
      value = parent[key];
    }

    if (isSchema(parent) && !isItemCollection(value)) {
      const subscribe = (callback: () => void) => {
        const parentAsSchema = parent as Schema;
        return parentAsSchema.listen(key as any, () => callback());
      };

      return useSyncExternalStore(subscribe, getSnapshot);
    }

    if (isItemCollection(value)) {
      const subscribe = (callback: () => void) => {
        const valueAsItemCollection = value as
          | ArraySchema
          | SetSchema
          | MapSchema;

        const clearOnAddListener = valueAsItemCollection.onAdd(
          () => callback(),
          false
        );
        const clearOnRemoveListener = valueAsItemCollection.onRemove(() =>
          callback()
        );

        return () => {
          clearOnAddListener();
          clearOnRemoveListener();
        };
      };

      return useSyncExternalStore(subscribe, getSnapshot);
    }

    const subscribe = (callback: () => void) => {
      callback();
      return () => {};
    };

    return useSyncExternalStore(subscribe, getSnapshot);
  }

  return {
    useColyseusState,
  };
};
