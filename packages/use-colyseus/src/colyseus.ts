import { ArraySchema, MapSchema, Schema, SetSchema } from "@colyseus/schema";
import { type Room } from "colyseus.js";
import { useSyncExternalStore } from "react";

import { proxy } from "./proxy";
import { isArraySchema, isMapSchema, isSchema, isSetSchema } from "./utils";

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

    const getSnapshot = () => {
      let value: any = room.state;

      for (let i = 0; i < path.length; i++) {
        value = value[path[i]];
      }

      // TODO(pedr0fontoura): See if we can optimize this
      if (isSchema(value)) {
        return value.clone();
      }

      if (isArraySchema(value) || isSetSchema(value) || isMapSchema(value)) {
        return value.clone();
      }

      return value;
    };

    let value: any = room.state;

    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        if (isSchema(value)) {
          const subscribe = (callback: () => void) => {
            // This is should be narrowed by the by the if clause above, but TS is weird.
            const valueAsSchema = value as Schema;
            return valueAsSchema.listen(path[i] as any, () => callback());
          };

          return useSyncExternalStore(subscribe, getSnapshot);
        }

        // TODO(pedr0fontoura): Listen for changes on the collection items?
        if (isArraySchema(value) || isSetSchema(value) || isMapSchema(value)) {
          const subscribe = (callback: () => void) => {
            const valueAsCollectionOfItems = value as
              | ArraySchema
              | SetSchema
              | MapSchema;

            const clearOnAddListener = valueAsCollectionOfItems.onAdd(() =>
              callback()
            );
            const clearOnRemoveListener = valueAsCollectionOfItems.onRemove(
              () => callback()
            );

            return () => {
              clearOnAddListener();
              clearOnRemoveListener();
            };
          };

          return useSyncExternalStore(subscribe, getSnapshot);
        }
      }

      value = value[path[i]];
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
