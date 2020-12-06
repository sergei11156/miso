import {
  PlatformDragging,
  PlatformDragStartOrEnd,
  userInputEvents,
} from "./interfaces/interfaces";
import { GameScene } from "./gameScene";
import PlatformServer from "./platforms/PlatformServer";
import PlatformManager from "./platforms/platformManager";

export default class UserInputServer {
  static userInputs: Set<UserInputServer> = new Set();
  ready = false;
  platformManager: PlatformManager;

  constructor(socket: SocketIO.Socket, scene: GameScene, platformManager: PlatformManager) {
    this.platformManager = platformManager;
    socket.on(userInputEvents.dragStart, (params: PlatformDragStartOrEnd) => {
      this.platformManager.dragStart(params, socket);
    });
    socket.on(userInputEvents.dragEnd, (params: PlatformDragStartOrEnd) => {
      this.platformManager.dragEnd(params, socket);
    });
    socket.on(userInputEvents.dragging, (params: PlatformDragging) => {
      this.platformManager.dragging(params, socket);
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
