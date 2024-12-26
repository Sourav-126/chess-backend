import WebSocket, { WebSocketServer } from "ws";
import { games } from "./games";
import { INIT_GAME } from "./messages";
import { MOVE } from "./messages";
export class GameManager {
  private games: games[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addhandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
  }

  private addhandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type == INIT_GAME) {
        if (this.pendingUser) {
          const game = new games(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = socket;
        }
      }
      if (message.type == MOVE) {
        const game = this.games.find(
          (game) => game.player1 == socket || game.player2 == socket
        );
        if (game) {
          game.makeMove(socket, message.payload.move);
        }
      }
    });
  }
}
