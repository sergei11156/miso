import {
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "../interfaces/interfaces";
import { createDude, dudeFromServerEvents } from "../interfaces/dudeInterfaces";
import { platformEventsFromServer } from "../interfaces/platformInterfaces";
import userConnectionManager from "./userConnectionManager";

export default class userOutput {
  room: string;
  socket: SocketIO.Socket;
  userConnectionManager: userConnectionManager;
  constructor(
    socket: SocketIO.Socket,
    userConnectionManager: userConnectionManager,
    roomName: string
  ) {
    this.room = roomName;
    this.socket = socket;
    this.userConnectionManager = userConnectionManager;
  }

  createDude(params: createDude, sendToAll = false) {
    if (sendToAll) {
      this.socket.broadcast
        .in(this.room)
        .emit(dudeFromServerEvents.createDude, params);
    } else {
      this.socket.emit(dudeFromServerEvents.createDude, params);
    }
  }

  update(params: gameUpdateObject) {
    this.socket.broadcast.in(this.room).emit(userInputEvents.update, params);
    this.socket.emit(userInputEvents.update, params);
  }

  die(id: number) {
    console.log("die message send");

    const youDead: youDie = {
      id,
    };
    this.socket.emit(userInputEvents.youDie, youDead);
    this.socket.broadcast.in(this.room).emit(userInputEvents.die, youDead);
  }

  win() {
    console.log("win message send");
    this.userConnectionManager.updateUsersList();
    this.socket.emit(userInputEvents.win);
  }

  destroyPlatform(id: number, sendToAllExceptMe = true) {
    if (sendToAllExceptMe) {
      this.socket.broadcast
        .in(this.room)
        .emit(platformEventsFromServer.destroyPlatform, { id });
    }
  }

  removeDude(id: number) {
    this.socket.broadcast.to(this.room).emit(userInputEvents.remove, { id });
  }
}
