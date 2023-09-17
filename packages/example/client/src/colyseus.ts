import { colyseus } from "use-colyseus";
import { GameState } from "shared/schema";

export const {
  client,
  connectToColyseus,
  disconnectFromColyseus,
  useColyseusRoom,
  useColyseusState,
} = colyseus("ws://localhost:2567", GameState);
