import { gameUpdateObject, userInputEvents, youDie } from "../interfaces/interfaces";
import { createDude, dudeFromServerEvents } from "../interfaces/dudeInterfaces";

export default class userOutput {
  room: string;
  socket: SocketIO.Socket;
  constructor(socket: SocketIO.Socket, roomName: string) {
    this.room = roomName;
    this.socket = socket;
  }

  createDude(params: createDude, sendToAll = false) {
    if (sendToAll) {
      this.socket.broadcast.emit(dudeFromServerEvents.createDude, params);
    } else {
      this.socket.emit(dudeFromServerEvents.createDude, params);
    }
  }

  update(params: gameUpdateObject) {
    this.socket.broadcast.emit(userInputEvents.update, params);
    this.socket.emit(userInputEvents.update, params);
  }

  die(id: number) {
    console.log("die message send");
    
    const youDead: youDie = {
      id,
    };
    this.socket.emit(userInputEvents.youDie, youDead);
    this.socket.broadcast.emit(userInputEvents.die, youDead)
  }

  win() {
    console.log("win message send");
    this.socket.emit(userInputEvents.win);
  }
}
