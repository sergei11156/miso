import {
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "../interfaces/interfaces";
import { createDude, dudeFromServerEvents } from "../interfaces/dudeInterfaces";
import { platformEventsFromServer } from "../interfaces/platformInterfaces";
import userConnectionManager from "./userConnectionManager";
import {
  updatePointerPosition,
  youDieWithScore,
} from "../interfaces/gameSceneInterfaces";
import { gameSceneFromServer } from "../interfaces/gameSceneInterfaces";

export default class userOutput {
  room: string;
  socket: SocketIO.Socket;
  userConnectionManager: userConnectionManager;
  score: number = undefined;
  userName: string;
  id: number;
  constructor(
    socket: SocketIO.Socket,
    userConnectionManager: userConnectionManager,
    roomName: string,
    userName: string,
    id: number
  ) {
    this.room = roomName;
    this.socket = socket;
    this.userName = userName;
    this.id = id;
    this.userConnectionManager = userConnectionManager;
  }

  createDude(params: createDude, sendToAll = false) {
    if (sendToAll) {
      this.socket.broadcast
        .to(this.room)
        .emit(dudeFromServerEvents.createDude, params);

      this.sendNewPointer();
    } else {
      this.socket.emit(dudeFromServerEvents.createDude, params);
    }
  }

  update(params: gameUpdateObject) {
    this.socket.broadcast.to(this.room).emit(userInputEvents.update, params);
    this.socket.emit(userInputEvents.update, params);
  }

  die(score: number) {
    this.score = score;
    const youDead: youDieWithScore = {
      score,
    };
    this.socket.emit(gameSceneFromServer.youDieWithScore, youDead);
    this.userConnectionManager.updateUsersListWithScore();
    this.removePointer();
    // this.socket.broadcast.in(this.room).emit(userInputEvents.die, youDead);
  }

  win() {
    this.score = 1;
    this.socket.emit(gameSceneFromServer.victory);
    this.userConnectionManager.updateUsersListWithScore();
    this.removePointer();
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

  pointer(sendObject: updatePointerPosition) {
    this.socket.broadcast
      .to(this.room)
      .emit(gameSceneFromServer.updatePointer, sendObject);
  }

  removePointer() {
    this.socket.broadcast
      .to(this.room)
      .emit(gameSceneFromServer.removePointer, this.id);
  }

  sendNewPointer() {
    this.socket.broadcast
      .to(this.room)
      .emit(gameSceneFromServer.createPointer, {
        id: this.id,
        name: this.userName,
      });
  }
}
