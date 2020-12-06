import { GameScene } from "../gameScene";
import PlatformManager from "../platforms/platformManager";
import userConnectionManager from "./userConnectionManager";
import UserInputServer from "./userInputServer";
import userOutput from "./userOutput";

export default class userConnection {
  ready = false;
  private room: string;
  private socket: SocketIO.Socket;
  send: userOutput;
  userInput: UserInputServer;
  constructor(
    socket: SocketIO.Socket,
    roomName: string,
    platformManager: PlatformManager,
    scene: GameScene,
    userConnectionManager: userConnectionManager
  ) {
    this.room = roomName;
    this.socket = socket;
    this.send = new userOutput(socket, roomName);
    this.userInput = new UserInputServer(socket, scene, platformManager, userConnectionManager, this);
  }
}
