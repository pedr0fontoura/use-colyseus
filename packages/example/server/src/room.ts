import http from "http";
import { Room, Client } from "colyseus";

import { GameState } from "shared/schema";

export class GameRoom extends Room<GameState> {
  // When room is initialized
  override onCreate(options: any) {
    this.setState(new GameState());

    this.setSimulationInterval((deltaTime) => {
      this.state.networkTime += this.clock.currentTime;
    });
  }

  // Authorize client based on provided options before WebSocket handshake is complete
  override onAuth(client: Client, options: any, request: http.IncomingMessage) {
    return true;
  }

  // When client successfully join the room
  override onJoin(client: Client, options: any, auth: any) {
    this.state.clients += 1;
  }

  // When a client leaves the room
  override onLeave(client: Client, consented: boolean) {
    this.state.clients -= 1;
  }

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  override onDispose() {}
}
