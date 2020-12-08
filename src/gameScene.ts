import { userInputEvents } from "./interfaces/interfaces";
import DudeServer from "./dude/dudeServer";
import GameObject from "./gameObject";
import PlatformServer from "./platforms/PlatformServer";
import DudeManager from "./dude/dudeManager";
import PlatformManager from "./platforms/platformManager";
import { gameSceneFromClient } from "./interfaces/gameSceneInterfaces";
import userConnectionManager from "./connection/userConnectionManager";
import Room from "./rooms/room";

export class GameScene extends Phaser.Scene {

  io: SocketIO.Server;
  startPlayerYPosition = 200;
  static lastObjectId: number = 0;
  playerId: number;

  worldWidth = 4000;
  private _gameStarted = false;
  private _gameStateCallback: (gameStarted: boolean) => void;
  get gameStarted() {
    return this._gameStarted;
  }
  private key: string;
  dudeManager: DudeManager;
  platformManager: PlatformManager;
  userConnectionManager: userConnectionManager;

  private defaultForceGameStartTime = 10000;
  private forceStartTimer = 0;
  private forceTimerIsTik = false;
  init(params: { io: SocketIO.Server; key: string, room: Room }) {
    this.io = params.io;
    this.key = params.key;
    const platforms = this.physics.add.group();
    const dudesGroup = this.physics.add.group();
    this.platformManager = new PlatformManager(this.io, platforms);
    this.dudeManager = new DudeManager(
      dudesGroup,
      this.worldWidth / 2,
      this.platformManager,
      () => this.gameStop()
    );

    this.physics.add.collider(
      dudesGroup,
      platforms,
      (object1: GameObject, object2: GameObject) =>
        this.dudeCollideWithPlatform(object1, object2)
    );
    this.userConnectionManager = new userConnectionManager(
      params.key,
      params.io,
      this.platformManager,
      this,
      params.room
    );
  }

  create() {
    console.log("gameScene started " + this.key);
  }

  dudeCollideWithPlatform(object1: GameObject, object2: GameObject) {
    if (!this._gameStarted) return;

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

  update(time: number, delta: number): void {
    if (this._gameStarted) {
      this.dudeManager.update(delta);
    }

    if (this.forceTimerIsTik && !this.gameStarted) {
      this.forceStartTimer+=delta;
      // this.io.in
      let time =  Math.floor((this.defaultForceGameStartTime - this.forceStartTimer) / 1000);
      this.userConnectionManager.timerUpdater(time);
    
      if (this.forceStartTimer > this.defaultForceGameStartTime) {
        this.forceGameStartTimerOff();
        this.restartGame();
      }
    }
  }

  restartGame() {
    this.physics.resume();
    this.forceGameStartTimerOff();
    this.io.emit(userInputEvents.restartGame);
    this.platformManager.clear();
    this._gameStarted = true;
    this.platformManager.gameStarted = true;
    this.dudeManager.startGame();
    this._gameStateCallback(true);
  }

  gameStop() {
    this._gameStarted = false;
    this.platformManager.clear();
    this.platformManager.gameStarted = false;
    this.userConnectionManager.setAllToNotReady();
    this.dudeManager.gameEnd();
    this._gameStateCallback(false);
  }

  newUserConnect(socket: SocketIO.Socket, name: string) {
    let dude: DudeServer;
    let uis = this.userConnectionManager.addConnection(socket, name);
    socket.on(gameSceneFromClient.sceneReady, () => {
      dude = this.dudeManager.add(uis);
    });
    socket.on("disconnect", (reason) => {
      let removeId = dude.id;
      if (dude) {
        this.dudeManager.dudes.remove(dude, true, true);
      }
      if (uis) {
        this.userConnectionManager.remove(uis, removeId);
      }
    });
  }

  setGameStateCallback(f: (gameStarted: boolean)=>void) {
    this._gameStateCallback = f;
  }

  forceGameStartTimerOff() {
    this.forceTimerIsTik = false;
    this.forceStartTimer = 0;
    this.userConnectionManager.timerGameStartOff();
  }
  forceGameStartTimerOn() {
    if (this.gameStarted) {
      return;
    }
    this.forceTimerIsTik = true; 
    this.forceStartTimer = 0;
    this.userConnectionManager.timerGameStartOn();
  }
}
