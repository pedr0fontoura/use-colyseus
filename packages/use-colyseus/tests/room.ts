import { ArraySchema, Schema, type } from "@colyseus/schema";
import { Room, Client } from "colyseus";
import config from "@colyseus/tools";

export class NestedSchema extends Schema {
  @type("number") x = 0;
  @type("number") y = 0;
}

export class GameState extends Schema {
  @type("number")
  networkTime = 0;

  @type("number")
  clients = 0;

  @type(NestedSchema)
  nested = new NestedSchema();

  @type([NestedSchema])
  arrayOfNestedSchemas = new ArraySchema<NestedSchema>();
}

export class GameRoom extends Room<GameState> {
  // When room is initialized
  override onCreate(options: any) {
    this.setState(new GameState());

    this.setSimulationInterval((deltaTime) => {
      this.state.networkTime = this.clock.currentTime;
    });
  }

  // Authorize client based on provided options before WebSocket handshake is complete
  override onAuth(client: Client, options: any) {
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

export const gameConfig = config({
  initializeGameServer: (gameServer) => {
    gameServer.define("my_room", GameRoom);
  },
});
