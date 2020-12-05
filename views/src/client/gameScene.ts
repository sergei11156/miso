import "phaser";
import {
  die,
  gameCreateObject,
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "./interfaces/interfaces";
import { MiscoGame } from "./client";
import Dude from "./Dude";
import GameObject from "./gameObject";
import Platform from "./Platform";

export class GameScene extends Phaser.Scene {
  // player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms: Phaser.Physics.Arcade.Group;
  // platformTimer: number;
  private cameraFollow?: GameObject;
  private gameObjects: GameObject[] = [];
  private _io: SocketIOClient.Socket;
  statusText: Phaser.GameObjects.Text;
  youDieText: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "GameScene",
    });
  }
  preload(): void {
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.image("ground", "assets/platform.png");
  }

  create(): void {
    this._io = (this.game as MiscoGame).io;
    Platform.init(this._io);

    this._io.on("create", (params: gameCreateObject) => {
      console.log(params);

      let gameObject;
      switch (params.key) {
        case "dude":
          gameObject = new Dude(this, params);
          break;
        case "ground":
          gameObject = Platform.add(this, params);
          break;
        default:
          gameObject = new GameObject(this, params);
          break;
      }

      // console.log("create " + gameObject.id + " key " + params.key + " cmrf " + params.cameraFollow);

      if (params.cameraFollow) {
        this.cameraFollow = gameObject;
        this.cameraStartFollow();
      }

      this.gameObjects.push(gameObject);
      // console.log(this.gameObjects);
    });

    this._io.on(userInputEvents.update, (params: gameUpdateObject) => {
      // console.log("update " + params.id);
      try {
        let gameObject = this.getGameObject(params.id);

        gameObject.update(params);
      } catch (error) {
        console.log(error);
      }
    });

    this._io.on(userInputEvents.restartGame, () => {
      this.restartGame();
    });

    this._io.on(userInputEvents.youDie, (params: youDie) => {
      this.youDieText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "ВЫ НЕ СПАСЛИСЬ"
      );
      this.youDieText.scrollFactorX = 0;
      this.youDieText.scrollFactorY = 0;
      if (params.newFollowId) {
        const newFollow = this.getGameObject(params.newFollowId);
        this.cameraFollow = newFollow;
        this.cameraStartFollow();
      }

      console.log("IM DIE");
      Platform.imDead = true;
    });
    this._io.on(userInputEvents.win, () => {
      console.log("I WIN");
      
      this.youDieText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "ВЫ СПАСЛИСЬ! ТИПО ПОБЕДИЛИ, РЕСПЕКЕТ, КРАСАВА"
      );
      this.youDieText.scrollFactorX = 0;
      this.youDieText.scrollFactorY = 0;
    });
    this._io.on(userInputEvents.remove, (params: die) => {
      console.log(params);
    });
    this._io.on(userInputEvents.remove, (params: { id: number }) => {
      this.getGameObject(params.id).destroy();
    });

    this.anims.create({
      key: "always",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cameras.main.setBounds(0, 0, 20000, 2e6);
    this.physics.world.setBounds(0, 0, 20000, 2e6);

    this.statusText = this.add.text(20, 20, "СТАТУС: НЕ ГОТОВ");

    this.statusText.scrollFactorX = 0;
    this.statusText.scrollFactorY = 0;
    this.statusText.setInteractive();
    this.statusText.on("pointerdown", () => {
      this.statusText.text = "СТАТУС: ГОТОВ";
      this._io.emit(userInputEvents.ready);
    });
    this._io.emit(userInputEvents.init);
  }
  update(time: number, delta: number): void {}

  restartGame() {
    console.log("restartGAME");
    this.statusText.text = "СТАТУС: НЕ ГОТОВ";

    if (this.youDieText) {
      this.youDieText.destroy();
      this.youDieText = undefined;
    }

    for (const gameObject of this.gameObjects) {
      gameObject.destroy();
    }
    this.gameObjects = [];
  }

  private getGameObject(id: number): GameObject {
    for (const gameObject of this.gameObjects) {
      if (gameObject.id == id) {
        return gameObject;
      }
    }
    throw new Error("object with id:" + id + " not found");
  }

  cameraStartFollow() {
    if (this.cameraFollow) {
      this.cameras.main.startFollow(
        this.cameraFollow.sprite,
        false,
        1,
        1,
        0,
        -(this.cameras.main.height / 2) * 0.7
      );
    }
  }
}
