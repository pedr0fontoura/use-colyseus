import { Schema, type } from "@colyseus/schema";

export class GameState extends Schema {
  @type("number")
  networkTime = 0;

  @type("number")
  clients = 0;
}
