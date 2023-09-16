import { useSyncExternalStore } from "react";

import { colyseusStore } from "./colyseus";

export function useColyseus() {
  const subscribe = (callback: () => void) => {
    const clearListener = colyseusStore.subscribe(() => callback());
    return () => {
      clearListener();
    };
  };

  const getSnapshot = () => {
    const colyseus = colyseusStore.get();
    return colyseus;
  };

  return useSyncExternalStore(subscribe, getSnapshot);
}
