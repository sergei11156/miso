import { gameSceneFromServer, userList } from "../interfaces/gameSceneInterfaces";
import { GameScene } from "../gameScene";
import PlatformManager from "../platforms/platformManager";
import userConnection from "./userConnection";
import Room from "../rooms/room";

export default class userConnectionManager {
  connections: Set<userConnection> = new Set();
  io: SocketIO.Server;
  room: string;
  platformManager: PlatformManager;
  scene: GameScene;
  private _lastId = 0;
  roomClass: Room;
  get newId() {
    this._lastId++;
    return this._lastId;
  }

  constructor(
    roomName: string,
    io: SocketIO.Server,
    platformManager: PlatformManager,
    scene: GameScene,
    room: Room
  ) {
    this.room = roomName;
    this.io = io;
    this.platformManager = platformManager;
    this.scene = scene;
    this.roomClass = room;
  }

  addConnection(socket: SocketIO.Socket, name: string) {
    const connection = new userConnection(
      socket,
      this.room,
      this.platformManager,
      this.scene,
      this,
      name,
      this.newId
    );
    this.connections.add(connection);
    this.updateUsersList();
    return connection;
  }
  updateUsersList() {
    let params: userList = {users: []};
    for (const connection of this.connections) {
      params.users.push({
        id: connection.id,
        name: connection.userName,
        statusReady: connection.ready
      });
    }
    this.io.to(this.room).emit(gameSceneFromServer.userList, params)
  }
  isAllReady() {
    if (this.connections.size < 2) {
      return false;
    }
    let result = true;
    for (const user of this.connections) {
      if (!user.ready) {
        result = false;
      }
    }
    return result;
  }

  setAllToNotReady() {
    for (const user of this.connections) {
      user.ready = false;
    }
    this.updateUsersList();
  }

  remove(connection: userConnection, id: number) {
    connection.send.removeDude(id);
    this.connections.delete(connection);
    this.updateUsersList();
  }
  chcekIfRoomCanStart() {
    this.roomClass.checkIfRoomCanStart();
  }
  timerGameStartOn() {
    this.io.to(this.room).emit(gameSceneFromServer.gameStartTimerOn);
  }
  timerGameStartOff() {
    this.io.to(this.room).emit(gameSceneFromServer.gameStartTimerOff);
  }
  timerUpdater(time: number) {
    this.io.to(this.room).emit(gameSceneFromServer.gameStartTimerUpdate, time)
  }

}
