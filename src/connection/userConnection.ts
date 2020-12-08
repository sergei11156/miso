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
  userName: string;
  id: number;
  constructor(
    socket: SocketIO.Socket,
    roomName: string,
    platformManager: PlatformManager,
    scene: GameScene,
    userConnectionManager: userConnectionManager,
    name: string,
    id: number
  ) {
    this.id = id;
    this.room = roomName;
    this.socket = socket;
    this.send = new userOutput(socket, userConnectionManager, roomName);
    this.userInput = new UserInputServer(socket, scene, platformManager, userConnectionManager, this);
    this.userName = name;
  }
}
