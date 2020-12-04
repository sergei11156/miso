import "phaser";
import PlatformServer from "./PlatformServer";
import UserInputServer from "./userInputServer";

export class GameScene extends Phaser.Scene {
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms: Phaser.Physics.Arcade.Group;
  platformTimer: number;
  io: any;
  startPlayerYPosition = 200;
  static lastObjectId: number = 0;
  playerId: number;

  worldWidth = 4000

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
    PlatformServer.platforms = this.platforms

    this.platformTimer = 0;

    this.io = window.io;
    PlatformServer.init(this.io);
    
    PlatformServer.player = this.player

    this.io.on("connection", (socket: SocketIO.Socket) => {
      console.log("new connecton");
      new UserInputServer(socket);
      socket.on("init", ()=> {
        this.restartGame(socket);
      });
    });
  }


  update(time: number, delta: number): void {
    PlatformServer.update(delta)
    

    this.io.emit("update", {
      id: this.playerId,
      x: this.player.body.x,
      y: this.player.body.y
    });
  }

  restartGame(socket?: SocketIO.Socket) {
    this.platforms.clear(true, true);
    this.player.body.position = new Phaser.Math.Vector2(
      this.worldWidth / 2,
      this.startPlayerYPosition
    );
    this.player.setVelocityY(200);

    this.io.emit("restartGame")
    this.playerId = GameScene.getNewId(); 
    this.io.emit("create", {
      key: "dude",
      id: this.playerId,
      x: this.player.body.position.x,
      y: this.player.body.position.y,
      cameraFollow: true
    });
    
    PlatformServer.spawnPlatform();
    console.log("create new dude " + this.playerId);
    
  }
  
  static getNewId() {
    this.lastObjectId++;
    return this.lastObjectId;
  }
}
