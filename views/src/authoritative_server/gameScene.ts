import "phaser";
import { userInputEvents } from "../interfaces";
import DudeServer from "./dudeServer";
import PlatformServer from "./PlatformServer";
import UserInputServer from "./userInputServer";

export class GameScene extends Phaser.Scene {
  platforms: Phaser.Physics.Arcade.Group;

  io: any;
  startPlayerYPosition = 200;
  static lastObjectId: number = 0;
  playerId: number;

  worldWidth = 4000;
  dudesGroup: Phaser.Physics.Arcade.Group;

  constructor() {
    super({
      key: "GameScene",
    });
  }

  preload() {
    this.load.spritesheet("dude", "../assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("ground", "../assets/platform.png");
  }

  create() {
    this.io = window.io;

    this.platforms = this.physics.add.group();
    this.dudesGroup = this.physics.add.group();

    this.physics.add.collider(this.dudesGroup, this.platforms, () =>
      this.restartGame()
    );

    DudeServer.init(this.io, this.dudesGroup, this.worldWidth / 2);
    PlatformServer.init(this.io, this.platforms);

    this.io.on("connection", (socket: SocketIO.Socket) => {
      console.log("new connection");

      new UserInputServer(socket);

      let dude: DudeServer;

      socket.on("init", () => {
        dude = DudeServer.add(GameScene.getNewId(), socket);
        this.restartGame();
      });

      socket.on("disconnect", (reason) => {
        if (dude) {
          DudeServer.remove(dude.id);
        }
      });
    });
  }

  update(time: number, delta: number): void {
    DudeServer.update(delta);
  }

  restartGame() {
    this.io.emit(userInputEvents.restartGame)
    PlatformServer.clear();

    DudeServer.startGame();
  }

  static getNewId() {
    this.lastObjectId++;
    return this.lastObjectId;
  }
}
