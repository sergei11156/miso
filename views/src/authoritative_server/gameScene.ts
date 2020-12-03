import { Vector } from "matter";
import "phaser";

export class GameScene extends Phaser.Scene {
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms: Phaser.Physics.Arcade.Group;
  platformTimer: number;
  io: any;
  startPlayerYPosition = 200;
  lastObjectId: number = 0;
  playerId: number;

  worldWidth = 4000

  constructor() {
    super({
      key: "GameScene",
    });
  }

  preload(): void {
    this.load.spritesheet("dude", "../assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("ground", "../assets/platform.png");
  }

  create(): void {
    console.log("CREATE 1");
    
    this.player = this.physics.add.sprite(
      this.worldWidth/2,
      this.startPlayerYPosition,
      "dude"
    );
    this.player.setCollideWorldBounds(false);

    this.platforms = this.physics.add.group();
    this.physics.add.collider(
      this.player,
      this.platforms,
      () => this.restartGame()
    );

    this.platformTimer = 0;

    this.io = window.io;

    this.io.on("connection", (socket: SocketIO.Socket) => {
      console.log("new connecton");
      
      socket.on("init", ()=> {
        this.restartGame(socket);
      });
    });
  }
  update(time: number, delta: number): void {
    // this.io.emit("updatePlayerPosition", this.player.body.position);


    this.platformTimer += delta;
    if (this.platformTimer > 500) {
      this.platformTimer = 0;
      this.spawnPlatform();
    }

    this.io.emit("update", {
      id: this.playerId,
      x: this.player.body.x,
      y: this.player.body.y
    });
  }

  spawnPlatform() {
    let playerBottomCenter = this.player.getBottomCenter();

    let platformX = playerBottomCenter.x - Phaser.Math.Between(-400, 200);
    let platformY = playerBottomCenter.y + 800;
    let platform = this.platforms.create(platformX, platformY, "ground");

    this.io.emit("create", {
      key: "ground",
      id: this.getNewId(),
      x: platformX,
      y: platformY,
    });
    // platform.setInteractive();
    // this.input.setDraggable(platform);

    // //  The pointer has to move 16 pixels before it's considered as a drag
    // this.input.dragDistanceThreshold = 1;

    // this.input.on("dragstart", function (pointer: any, gameObject: any) {
    //   gameObject.setTint(0xff0000);
    // });

    // this.input.on(
    //   "drag",
    //   function (pointer: any, gameObject: any, dragX: any, dragY: any) {
    //     gameObject.x = dragX;
    //     gameObject.y = dragY;
    //   }
    // );

    // this.input.on("dragend", function (pointer: any, gameObject: any) {
    //   gameObject.clearTint();
    // });
  }

  // platformCollision() {
    // this.restartGame();
    // alert("ПОТРАЧЕНО");
  // }

  restartGame(socket?: SocketIO.Socket) {
    this.platforms.clear(true, true);
    this.player.body.position = new Phaser.Math.Vector2(
      this.worldWidth / 2,
      this.startPlayerYPosition
    );
    this.player.setVelocityY(200);
    if (socket) {
      socket.emit("restartGame")
      this.playerId = this.getNewId(); 
      socket.emit("create", {
        key: "dude",
        id: this.playerId,
        x: this.player.body.position.x,
        y: this.player.body.position.y,
        cameraFollow: true
      });
    } else {
      this.io.emit("restartGame");
      this.playerId = this.getNewId(); 
      this.io.emit("create", {
        key: "dude",
        id: this.playerId,
        x: this.player.body.position.x,
        y: this.player.body.position.y,
        cameraFollow: true
      });
    }
    this.spawnPlatform();
    console.log("create new dude " + this.playerId);
    
  }
  
  private getNewId() {
    this.lastObjectId++;
    return this.lastObjectId;
  }
}
