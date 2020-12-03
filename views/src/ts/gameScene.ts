import "phaser";
import { MiscoGame } from "../main";
import GameObject from "./gameObject";

export interface gameUpdater {
  key: string,
  id: number,
  x: number,
  y: number,
  cameraFollow?: boolean
}

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
    this._io.on("create", (params: gameUpdater) => {
      console.log(params);
      
      let gameObject = new GameObject(this, params);
      console.log("create " + gameObject.id + " key " + params.key + " cmrf " + params.cameraFollow);

      if (params.cameraFollow) {
        this.cameraFollow = gameObject;
      }

      this.gameObjects.push(gameObject);
      console.log(this.gameObjects);
      
    })

    this._io.on("update", (params: any) => {
      console.log("update " + params.id);
      try {
        let gameObject = this.getGameObject(params.id);
  
        gameObject.updatePos(params.x, params.y);
      } catch (error) {
        console.log(error);
      }

    })

    this._io.on("restartGame", () => {
      this.restartGame()
    })
    // this.platforms = this.physics.add.group();
    // this.player = this.physics.add.sprite(
    //   this.cameras.main.displayWidth / 2,
    //   this.cameras.main.displayHeight / 2,
    //   "dude"
    // );
    // this.player.setCollideWorldBounds(false);

    this.anims.create({
      key: "always",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    // this.physics.add.collider(
    //   this.player,
    //   this.platforms,
    //   this.platformCollision
    // );

    // this.player.setVelocityY(200);
    // this.platformTimer = 0;
    // this.spawnPlatform();
    
    this._io.emit("init");
  }
  update(time: number, delta: number): void {
    // this.player.anims.play("always", true);

    if (this.cameraFollow) {
      // console.log("CAMERA FOLLOW TEST");
      
      this.cameras.main.startFollow(
        this.cameraFollow.sprite,
        true,
        0,
        0,
        0,
        -(this.cameras.main.height / 2) * 0.7
      );
    }

    // this.platformTimer += delta;
    // if (this.platformTimer > 500) {
    //   this.platformTimer = 0;
    //   this.spawnPlatform();
    // }
  }

  spawnPlatform() {
    // let playerBottomCenter = this.player.getBottomCenter();
    // let cameraYBottom =
    //   this.player.getTopCenter().y + this.cameras.main.displayHeight;

    // let platform = this.platforms.create(
    //   playerBottomCenter.x - Phaser.Math.Between(-400, 200),
    //   cameraYBottom + 100,
    //   "ground"
    // );
    // platform.setInteractive()
    // this.input.setDraggable(platform);

    // //  The pointer has to move 16 pixels before it's considered as a drag
    // this.input.dragDistanceThreshold = 1;

    // this.input.on("dragstart", function (pointer: any, gameObject: any) {
    //   gameObject.setTint(0xff0000);
    // });

    // this.input.on("drag", function (pointer: any, gameObject: any, dragX: any, dragY: any) {
    //   gameObject.x = dragX;
    //   gameObject.y = dragY;
    // });

    // this.input.on("dragend", function (pointer: any, gameObject: any) {
    //   gameObject.clearTint();
    // });
  }

  // platformCollision() {
  //   alert("ПОТРАЧЕНО");
  // }

  restartGame() {
    console.log("restartGAME");
    
    for (const gameObject of this.gameObjects) {
      gameObject.destroy();
    }
    this.gameObjects = [];
  }
  private getGameObject(id: number) : GameObject {
    for (const gameObject of this.gameObjects) {
      
      if (gameObject.id == id) {
        return gameObject;
      }
    }
    throw new Error("object with id:" + id + " not found");
  }
}
