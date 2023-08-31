import { useSyncExternalStore } from "react";

import { stateStore } from "./colyseus";

export function useColyseusState(
  listen: (fn: (...args: any[]) => void) => () => void
) {
  const subscribe = (callback: () => void) => {
    const clearListener = listen(() => callback());
    return () => {
      clearListener();
    };
  };

  const getSnapshot = () => {
    const state = stateStore.get();
    return state;
  };

  return useSyncExternalStore(subscribe, getSnapshot);
}
