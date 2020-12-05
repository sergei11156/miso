import {
  PlatformDragging,
  PlatformDragStartOrEnd,
  userInputEvents,
} from "./interfaces/interfaces";
import { GameScene } from "./gameScene";
import PlatformServer from "./PlatformServer";

export default class UserInputServer {
  static userInputs: Set<UserInputServer> = new Set();
  ready = false;

  constructor(socket: SocketIO.Socket, scene: GameScene) {
    socket.on(userInputEvents.dragStart, (params: PlatformDragStartOrEnd) => {
      PlatformServer.dragStart(params, socket);
    });
    socket.on(userInputEvents.dragEnd, (params: PlatformDragStartOrEnd) => {
      PlatformServer.dragEnd(params, socket);
    });
    socket.on(userInputEvents.dragging, (params: PlatformDragging) => {
      PlatformServer.dragging(params, socket);
    });
    socket.on(userInputEvents.ready, () => {
      this.ready = true;
      console.log("player ready");

      if (UserInputServer.isAllReady()) {
        console.log("all ready, start");

        scene.restartGame();
      }
    });
    UserInputServer.userInputs.add(this);
  }
  remove() {
    UserInputServer.userInputs.delete(this);
  }
  static isAllReady() {
    if (this.userInputs.size < 2) {
      return false;
    }
    let result = true;
    for (const user of this.userInputs) {
      if (!user.ready) {
        result = false;
      }
    }
    return result;
  }

  static setAllToNotReady() {
    for (const user of this.userInputs) {
      user.ready = false;
    }
  }
}
