import DudeServer from "../dude/dudeServer";
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
  dude: DudeServer;
  get score() {
    return this.send.score;
  }
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
    this.userName = name;

    this.send = new userOutput(socket, userConnectionManager, roomName, name, id);
    this.userInput = new UserInputServer(socket, scene, platformManager, userConnectionManager, this);
  }

  setDude(dude: DudeServer) {
    this.dude = dude
  }
}
