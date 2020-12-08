import {
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "../interfaces/interfaces";
import { createDude, dudeFromServerEvents } from "../interfaces/dudeInterfaces";
import { platformEventsFromServer } from "../interfaces/platformInterfaces";
import userConnectionManager from "./userConnectionManager";
import { youDieWithScore } from "../interfaces/gameSceneInterfaces";
import { gameSceneFromServer } from "../interfaces/gameSceneInterfaces";

export default class userOutput {
  room: string;
  socket: SocketIO.Socket;
  userConnectionManager: userConnectionManager;
  score: number = undefined;
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

  die(score: number) {
    this.score = score;
    const youDead: youDieWithScore = {
      score
    };
    this.socket.emit(gameSceneFromServer.youDieWithScore, youDead);
    this.userConnectionManager.updateUsersListWithScore();
    // this.socket.broadcast.in(this.room).emit(userInputEvents.die, youDead);
  }

  
  win() {
    this.score = 1;
    this.socket.emit(gameSceneFromServer.victory);
    this.userConnectionManager.updateUsersListWithScore();
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
