import { GameScene } from "../gameScene";
import PlatformManager from "../platforms/platformManager";
import userConnection from "./userConnection";

export default class userConnectionManager {
  connections: Set<userConnection> = new Set();
  io: SocketIO.Server;
  room: string;
  platformManager: PlatformManager;
  scene: GameScene;

  constructor(
    roomName: string,
    io: SocketIO.Server,
    platformManager: PlatformManager,
    scene: GameScene
  ) {
    this.room = roomName;
    this.io = io;
    this.platformManager = platformManager;
    this.scene = scene;
  }

  addConnection(socket: SocketIO.Socket) {
    const connection = new userConnection(
      socket,
      this.room,
      this.platformManager,
      this.scene,
      this
    );
    this.connections.add(connection);
    return connection;
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
      console.log(user.ready);
    }
  }

  remove(connection: userConnection) {
    this.connections.delete(connection);
  }
}
