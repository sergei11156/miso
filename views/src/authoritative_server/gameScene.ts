import { timingSafeEqual } from "crypto";
import "phaser";
import { userInputEvents } from "../interfaces";
import DudeServer from "./dudeServer";
import PlatformServer from "./PlatformServer";
import UserInputServer from "./userInputServer";

export class GameScene extends Phaser.Scene {
  io: any;
  startPlayerYPosition = 200;
  static lastObjectId: number = 0;
  playerId: number;

  worldWidth = 4000;

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

    const platforms = this.physics.add.group();
    const dudesGroup = this.physics.add.group();

    this.physics.add.collider(dudesGroup, platforms, (object1, object2) => {
      // console.log(object1);
      // console.log(object2);
      // this.physics.pause();
      this.restartGame()
    }
    );

    DudeServer.init(this.io, dudesGroup, this.worldWidth / 2);
    PlatformServer.init(this.io, platforms);

    this.io.on("connection", (socket: SocketIO.Socket) => {
      console.log("new connection");

      new UserInputServer(socket);

      let dude: DudeServer;

      socket.on("init", () => {
        dude = DudeServer.add(socket);
        this.restartGame();
      });

      socket.on("disconnect", (reason) => {
        if (dude) {
          DudeServer.dudes.remove(dude, true, true)
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

}
