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
import { createDude, dudeFromServerEvents } from "./interfaces/dudeInterfaces";
import { gameSceneFromClient } from "./interfaces/gameSceneInterfaces";
import {
  platformCreate,
  platformEventsFromServer,
} from "./interfaces/platformInterfaces";
import Pointer from "./pointer";
import RoomsScene from "./rooms/roomsScene";
import GameUI from "./gameUI";

export class GameScene extends Phaser.Scene {
  private cameraFollow?: GameObject;
  private gameObjects: GameObject[] = [];
  private io: SocketIOClient.Socket;
  statusText: Phaser.GameObjects.Text;
  youDieText: Phaser.GameObjects.Text;
  pointer: Pointer;
  redzones: Phaser.Physics.Arcade.Group;
  platforms: Phaser.Physics.Arcade.Group;

  ready: boolean = false;
  gameUIClass: GameUI;
  gameStarted: boolean = false;

  init(params: { io: SocketIOClient.Socket; roomName: string }) {
    this.io = params.io;
    this.redzones = this.physics.add.group();
    this.platforms = this.physics.add.group();

    this.io.on(dudeFromServerEvents.createDude, (params: createDude) => {
      const dude = new Dude(this, params, this.redzones);
      if (params.cameraFollow) {
        this.cameraFollow = dude;
        this.cameraStartFollow();
      }
      this.gameObjects.push(dude);

    });

    this.io.on(
      platformEventsFromServer.createPlatform,
      (params: platformCreate) => {
        const gameObject = Platform.add(this, params, this.platforms);
        this.gameObjects.push(gameObject);
      }
    );

    this.gameUIClass = new GameUI(this.io, this, params.roomName); 
  }


  preload(): void {
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.image("ground", "assets/platform.png");
    this.load.image("redzone", "assets/redZone.png");
    this.load.image("pointer", "assets/cursor.png");

    this.load.scenePlugin(
      "rexgesturesplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexgesturesplugin.min.js",
      "rexGestures",
      "rexGestures"
    );
  }

  create(): void {
    this.setPinch();


    // const test = this.physics.add.sprite(2000, 300, "ground")
    // this.platforms.add(test);
    // this.pointer = new Pointer(this, this.platforms);
    // this.input.setDefaultCursor("url(assets/cursor.png), pointer")

    Platform.init(this.io);
    // Platform.add(this, {id: 100, x: 2000, y: 300}, this.platforms)

    this.io.on(userInputEvents.update, (params: gameUpdateObject) => {
      // console.log("update " + params.id);
      try {
        let gameObject = this.getGameObject(params.id);

        gameObject.update(params);
      } catch (error) {
        console.log(error);
      }
    });

    this.io.on(userInputEvents.restartGame, () => {
      this.restartGame();
    });

    this.io.on(userInputEvents.youDie, (params: youDie) => {
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
      this.gameUIClass.gameEnd();
      this.gameStarted = false;
    });

    this.io.on(userInputEvents.win, () => {
      console.log("I WIN");

      this.youDieText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "ВЫ СПАСЛИСЬ! ТИПО ПОБЕДИЛИ, РЕСПЕКЕТ, КРАСАВА"
      );
      this.youDieText.scrollFactorX = 0;
      this.youDieText.scrollFactorY = 0;
      this.gameUIClass.gameEnd();
      this.gameStarted = false;
    });

    this.io.on(userInputEvents.remove, (params: { id: number }) => {
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

    this.io.emit(gameSceneFromClient.sceneReady);
  }



  update(time: number, delta: number): void {
    // console.log(this.input.activePointer);
    // this.pointer.setPosition(this, this.input.activePointer.worldX, this.input.activePointer.worldY, delta);
    Dude.isPointerInCloseZone(
      new Phaser.Math.Vector2(
        this.input.activePointer.worldX,
        this.input.activePointer.worldY
      )
    );
    Dude.updateAnims();
  }

  restartGame() {
    this.gameStarted = true;
    console.log("restartGAME");
    // this.statusText.text = "СТАТУС: НЕ ГОТОВ";
    this.gameUIClass.gameStart();
    this.gameUIClass.setButtonReadyState(false);

    if (this.youDieText) {
      this.youDieText.destroy();
      this.youDieText = undefined;
    }
    Platform.imDead = false;
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

  setPinch() {
    // @ts-ignore
    const pinch:any = this.rexGestures.add.pinch({
      enable: true,
      
    })
    pinch.on("pinch", (pinch1: any)=> {
      console.log("pinch");
      let zoom = this.cameras.main.zoom 
      zoom *= pinch1.scaleFactor;
      if (zoom > 0.5 && zoom < 1.2) {
        this.cameras.main.setZoom(zoom)
      }
    })
    this.input.on("wheel", (pointer: any, gameObjects: any, deltaX: number, deltaY: number, deltaZ :number) => {
      console.log({deltaX, deltaY, deltaZ});
      let zoom = this.cameras.main.zoom 
      if (deltaY > 0) {
        zoom -= 0.05
      } else {
        zoom += 0.05
      }
      if (zoom > 0.5 && zoom < 1.2) {
        this.cameras.main.setZoom(zoom)
      }

    });
  }
}
