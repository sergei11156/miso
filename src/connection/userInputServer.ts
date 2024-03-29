import {
  PlatformDragging,
  PlatformDragStartOrEnd,
  userInputEvents,
} from "../interfaces/interfaces";
import { GameScene } from "../gameScene";
import PlatformManager from "../platforms/platformManager";
import userConnectionManager from "./userConnectionManager";
import userConnection from "./userConnection";
import {
  platformDragToCloseZone,
  platformEventsFromClient,
} from "../interfaces/platformInterfaces";
import {
  gameSceneFromClient,
  pointerPosition,
  updatePointerPosition,
} from "../interfaces/gameSceneInterfaces";

export default class UserInputServer {
  platformManager: PlatformManager;
  userConnectionManager: userConnectionManager;
  connection: userConnection;

  constructor(
    socket: SocketIO.Socket,
    scene: GameScene,
    platformManager: PlatformManager,
    userConnectionManager: userConnectionManager,
    connection: userConnection
  ) {
    this.platformManager = platformManager;
    this.userConnectionManager = userConnectionManager;
    this.connection = connection;

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
      this.connection.ready = "ready";
      this.userConnectionManager.updateUsersList();
      if (this.userConnectionManager.isAllReady() && !scene.gameStarted) {
        scene.restartGame();
      } else {
        this.userConnectionManager.chcekIfRoomCanStart();
      }
    });
    socket.on(gameSceneFromClient.imNotReady, () => {
      this.connection.ready = "notready";
      this.userConnectionManager.updateUsersList();
      this.userConnectionManager.chcekIfRoomCanStart();
    });
    socket.on(
      platformEventsFromClient.platformDragToCloseZone,
      (params: platformDragToCloseZone) => {
        this.platformManager.destroyPlatform(params, this.connection);
      }
    );

    socket.on(
      gameSceneFromClient.pointerPosition,
      (params: pointerPosition) => {
        let sendObject: updatePointerPosition = {
          id: this.connection.id,
          x: params.x,
          y: params.y
        };
        this.connection.send.pointer(sendObject);
      }
    );

  }
}
