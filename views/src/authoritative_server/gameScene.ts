import "phaser";

export class GameScene extends Phaser.Scene {
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms: Phaser.Physics.Arcade.Group;
  platformTimer: number;
  io: any;
  constructor() {
    super({
      key: "GameScene",
    });
  }
  init(params: any): void {
    // TODO
  }
  preload(): void {
    this.load.spritesheet("dude", "../assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("ground", "../assets/platform.png");
  }

  create(): void {
    this.player = this.physics.add.sprite(
      this.cameras.main.displayWidth / 2,
      this.cameras.main.displayHeight / 2,
      "dude"
    );
    this.player.setCollideWorldBounds(false);

    this.platforms = this.physics.add.group();
    this.physics.add.collider(
      this.player,
      this.platforms,
      this.platformCollision
    );

    this.player.setVelocityY(200);
    this.platformTimer = 0;
    // this.spawnPlatform();

    this.io = window.io;

    this.io.on("connection", (socket: SocketIO.Socket) => {
        console.log("new connecton");

    })
  }
  update(time: number, delta: number): void {
    this.io.emit("updatePlayerPosition", this.player.body.position)
    // this.cameras.main.startFollow(
    //   this.player,
    //   true,
    //   0,
    //   0,
    //   0,
    //   -(this.cameras.main.height / 2) * 0.7
    // );

    this.platformTimer += delta;
    if (this.platformTimer > 500) {
      this.platformTimer = 0;
      // this.spawnPlatform();
    }
  }

  spawnPlatform() {
    let playerBottomCenter = this.player.getBottomCenter();
    let cameraYBottom =
      this.player.getTopCenter().y + this.cameras.main.displayHeight;

    let platform = this.platforms.create(
      playerBottomCenter.x - Phaser.Math.Between(-400, 200),
      cameraYBottom + 100,
      "ground"
    );
    platform.setInteractive();
    this.input.setDraggable(platform);

    //  The pointer has to move 16 pixels before it's considered as a drag
    this.input.dragDistanceThreshold = 1;

    this.input.on("dragstart", function (pointer: any, gameObject: any) {
      gameObject.setTint(0xff0000);
    });

    this.input.on(
      "drag",
      function (pointer: any, gameObject: any, dragX: any, dragY: any) {
        gameObject.x = dragX;
        gameObject.y = dragY;
      }
    );

    this.input.on("dragend", function (pointer: any, gameObject: any) {
      gameObject.clearTint();
    });
  }

  platformCollision() {
    // alert("ПОТРАЧЕНО");
  }
}
