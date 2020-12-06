import { userInputEvents } from "./interfaces/interfaces";
import DudeServer from "./dude/dudeServer";
import GameObject from "./gameObject";
import PlatformServer from "./platforms/PlatformServer";
import UserInputServer from "./userInputServer";
import GameServer from "./GameServer";
import DudeManager from "./dude/dudeManager";
import PlatformManager from "./platforms/platformManager";
import { gameSceneFromClient } from "./interfaces/gameSceneInterfaces";

export class GameScene extends Phaser.Scene {
  io: SocketIO.Server;
  startPlayerYPosition = 200;
  static lastObjectId: number = 0;
  playerId: number;

  worldWidth = 4000;
  private gameStarted = false;
  private key: string;
  dudeManager: DudeManager;
  platformManager: PlatformManager;

  init(params: { io: SocketIO.Server; key: string }) {
    this.io = params.io;
    this.key = params.key;
  }

  create() {
    console.log("gameScene started " + this.key);
    const platforms = this.physics.add.group();
    const dudesGroup = this.physics.add.group();

    this.physics.add.collider(
      dudesGroup,
      platforms,
      (object1: GameObject, object2: GameObject) => {
        let dude, platform;
        console.log(object1.key);

        if (object1.key == "dude") {
          dude = object1 as DudeServer;
          platform = object2 as PlatformServer;
        } else {
          dude = object2 as DudeServer;
          platform = object1 as PlatformServer;
        }

        dude.youDied();
      }
    );

    this.platformManager = new PlatformManager(this.io, platforms)

    this.dudeManager = new DudeManager(this.io, dudesGroup, this.worldWidth / 2, this.platformManager, () => this.gameStop);
    // PlatformServer.init(this.io, platforms);
  }

  update(time: number, delta: number): void {
    if (this.gameStarted) {
      this.dudeManager.update(delta);
    }
  }

  restartGame() {
    this.physics.resume();
    this.io.emit(userInputEvents.restartGame);
    this.platformManager.clear();
    this.gameStarted = true;
    this.platformManager.gameStarted = true;
    this.dudeManager.startGame();
  }

  gameStop() {
    this.gameStarted = false;
    this.platformManager.clear();
    this.platformManager.gameStarted = false;
    UserInputServer.setAllToNotReady();
    this.dudeManager.gameEnd();
  }

  newUserConnect(socket: SocketIO.Socket) {
    let dude: DudeServer;
    let uis = new UserInputServer(socket, this, this.platformManager);
    socket.on(gameSceneFromClient.sceneReady, () => {
      dude = this.dudeManager.add(socket);
    })
    socket.on("disconnect", (reason) => {
      if (dude) {
        let removeId = dude.id;
        this.dudeManager.dudes.remove(dude, true, true);
        socket.broadcast.emit(userInputEvents.remove, { id: removeId });
      }
      if (uis) {
        uis.remove();
      }
    });
  }

}
