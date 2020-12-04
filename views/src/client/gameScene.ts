import "phaser";
import {
  die,
  gameCreateObject,
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "../interfaces";
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

      this.gameObjects.push(gameObject);
      // console.log(this.gameObjects);
    });

    this._io.on("update", (params: gameUpdateObject) => {
      // console.log("update " + params.id);
      try {
        let gameObject = this.getGameObject(params.id);

        gameObject.update(params);
      } catch (error) {
        console.log(error);
      }
    });

    this._io.on("restartGame", () => {
      this.restartGame();
    });

    this._io.on("youDie", (params: youDie) => {
      const myDeadBody = this.getGameObject(params.id);
      const youDie = this.add.text(
        myDeadBody.sprite.x,
        myDeadBody.sprite.y,
        "ВЫ НЕ СПАСЛИСЬ"
      );
      youDie.scrollFactorX = 1;
      youDie.scrollFactorY = 1;
      const newFollow = this.getGameObject(params.newFollowId);
      this.cameraFollow = newFollow;
      console.log("IM DIE");
    });
    this._io.on("die", (params: die) => {
      console.log(params);
      
    })
    this.anims.create({
      key: "always",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this._io.emit("init");
    this.cameras.main.setBounds(0, 0, 20000, 2e6);
    this.physics.world.setBounds(0, 0, 20000, 2e6);
  }
  update(time: number, delta: number): void {

  }

  restartGame() {
    
    console.log("restartGAME");

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
}
