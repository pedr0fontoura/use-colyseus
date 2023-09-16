import { Server } from "colyseus";

import { GameRoom } from "./room";

const gameServer = new Server();

gameServer.define("test", GameRoom);
gameServer.listen(2567);
