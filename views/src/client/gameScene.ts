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
import PointerManager from "./pointer/pointersManager";

export class GameScene extends Phaser.Scene {
  private cameraFollow?: Dude;
  private gameObjects: GameObject[] = [];
  private io: SocketIOClient.Socket;
  statusText: Phaser.GameObjects.Text;
  pointer: Pointer;
  redzones: Phaser.Physics.Arcade.Group;
  platforms: Phaser.Physics.Arcade.Group;

  ready: boolean = false;
  gameUIClass: GameUI;
  gameStarted: boolean = false;
  pointerManager: PointerManager;
  windSound: Phaser.Sound.BaseSound;

  init(params: { io: SocketIOClient.Socket; roomName: string, isGameStarted: boolean }) {
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

    this.gameUIClass = new GameUI(this.io, this, params.roomName, params.isGameStarted);
    this.pointerManager = new PointerManager(this, this.io) 
  }


  preload(): void {
    this.load.spritesheet("dude", "assets/newdude.svg", {
      frameWidth: 96,
      frameHeight: 50,
      endFrame: 3
    });

    this.load.image("ground", "assets/platform.png");
    this.load.spritesheet("fire", "assets/fireanimation.svg", {
      frameWidth: 200,
      frameHeight: 95,
      endFrame: 4
    });
    this.load.image("redzone", "assets/redZone.png");
    this.load.image("pointer", "assets/cursor.png");

    this.load.scenePlugin(
      "rexgesturesplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexgesturesplugin.min.js",
      "rexGestures",
      "rexGestures"
    );
    this.load.audio("wind", "assets/wind.mp3");
  }

  create(): void {
    this.setPinch();
    this.windSound = this.sound.add("wind");
    Platform.init(this.io);

    this.io.on(userInputEvents.update, (params: gameUpdateObject) => {
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



    this.io.on(userInputEvents.remove, (params: { id: number }) => {
      this.getGameObject(params.id).destroy();
    });

    this.anims.create({
      key: "always",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "fireAnimation",
      frames: this.anims.generateFrameNumbers("fire", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.cameras.main.setBounds(0, 0, 20000, 2e6);
    this.physics.world.setBounds(0, 0, 20000, 2e6);

    this.io.emit(gameSceneFromClient.sceneReady);
  }

  gameStop() {
    Platform.imDead = true;
    this.windSound.stop();
    this.gameStarted = false;
  }

  update(time: number, delta: number): void {
    // console.log(this.input.activePointer);
    // this.pointer.setPosition(this, this.input.activePointer.worldX, this.input.activePointer.worldY, delta);
    if (this.gameStarted) {
      this.sendPointer(this.input.activePointer.worldX, this.input.activePointer.worldY);
      Dude.isPointerInCloseZone(
        new Phaser.Math.Vector2(
          this.input.activePointer.worldX,
          this.input.activePointer.worldY
        )
      );
    }
    Dude.updateAnims();
    Platform.animateAllPlatforms();
  }
  sendPointer(x: number, y: number) {
    this.io.emit(gameSceneFromClient.pointerPosition, {x, y})
  }

  restartGame() {
    this.gameStarted = true;
    this.gameUIClass.gameStart();
    this.gameUIClass.setButtonReadyState(false);
    this.windSound.play({
      loop: true,
      volume: 0.8
    })

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
      let zoom = this.cameras.main.zoom 
      zoom *= pinch1.scaleFactor;
      if (zoom > 0.5 && zoom < 1.2) {
        this.cameras.main.setZoom(zoom)
      }
    })
    this.input.on("wheel", (pointer: any, gameObjects: any, deltaX: number, deltaY: number, deltaZ :number) => {
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
