import { colyseus } from "../../../hooks/src/prototype-b";

import { GameState } from "shared/schema";

export const {
  client,
  connectToColyseus,
  disconnectFromColyseus,
  useColyseus,
  useColyseusState,
} = colyseus("ws://localhost:2567", GameState);
