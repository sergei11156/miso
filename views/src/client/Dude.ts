import { gameUpdateObject } from "./interfaces/interfaces";
import GameObject from "./gameObject";
import { GameScene } from "./gameScene";
import { createDude } from "./interfaces/dudeInterfaces";

export default class Dude extends GameObject {
  static dudes: Set<Dude> = new Set();
  graphics: Phaser.GameObjects.Graphics;
  circle: Phaser.Geom.Circle;
  myName: Phaser.GameObjects.Text;
  playerDude: boolean = false;
  scene: GameScene;
  // closezone: Phaser.Physics.Arcade.Sprite;
  // private closezone:
  constructor(
    scene: GameScene,
    params: createDude,
    redzone: Phaser.Physics.Arcade.Group
  ) {
    super(scene, params.id, params.x, params.y, "dude");
    this.scene = scene;
    const graphics = scene.add.graphics();
    this.graphics = graphics;
    this.graphics.alpha = 0;
    this.circle = new Phaser.Geom.Circle(params.x, params.y, 200);
    this.myName = scene.add.text(params.x, params.y, params.name);
    console.log(params.name);

    if (params.cameraFollow) {
      this.myName.setColor("#00FF08");
    } else {
      this.myName.setColor("#E43434");
    }
    this.updateTextPosition();
    Dude.dudes.add(this);
    if (params.cameraFollow) {
      this.playerDude = true;
    }
  }

  updateTextPosition() {
    const topCentre = this.sprite.getTopCenter();
    const width = this.myName.width;
    this.myName.setPosition(topCentre.x - width / 2, topCentre.y - 20);
  }

  updatePos(x: number, y: number) {
    super.updatePos(x, y);
    // this.closezone.setPosition(x, y)
  }
  updateAnimations() {
    this.sprite.anims.play("always", true);
    if (this.graphics.alpha > 0) {
      this.graphics.alpha -= 0.05;
      this.updateGraphicsPosition();
    }
    this.updateTextPosition();
  }
  destroy() {
    Dude.dudes.delete(this);
    this.myName.destroy();
    this.graphics.clear();
    this.graphics.destroy();
    super.destroy();
    // this.closezone.destroy();
  }

  updateGraphicsPosition() {
    const centre = this.sprite.getCenter();
    this.graphics.clear();
    this.graphics.fillStyle(0xff0000, 1);
    this.circle.setPosition(centre.x, centre.y);
    this.graphics.fillCircleShape(this.circle);
    // this.graphics.fillCircle(centre.x, centre.y, 150)
  }

  showCloseZone() {
    this.graphics.alpha = 0.5;
    this.updateGraphicsPosition();
  }

  static updateAnims() {
    for (const dude of this.dudes) {
      dude.updateAnimations();
    }
  }

  static isPointerInCloseZone(pointer: Phaser.Math.Vector2) {
    let isIt = false;

    for (const dude of this.dudes) {
      if (!dude.scene.gameStarted) {
        return false;
      }
      if (dude.playerDude) {
        continue;
      }
      const centre = dude.sprite.getCenter();
      const distance = Phaser.Math.Distance.BetweenPoints(pointer, centre);

      if (distance < 200) {
        dude.showCloseZone();
        isIt = true;
      }
    }
    return isIt;
  }
  static reset() {
    this.dudes = new Set();
  }
}
