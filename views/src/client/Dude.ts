import { gameUpdateObject } from "./interfaces/interfaces";
import GameObject from "./gameObject";
import { GameScene } from "./gameScene";
import { createDude } from "./interfaces/dudeInterfaces";

export default class Dude extends GameObject {
  static dudes: Set<Dude> = new Set();
  graphics: Phaser.GameObjects.Graphics;
  circle: Phaser.Geom.Circle;
  // closezone: Phaser.Physics.Arcade.Sprite;
  // private closezone:
  constructor(scene: GameScene, params: createDude, redzone: Phaser.Physics.Arcade.Group) {
    super(scene, params.id, params.x, params.y, "dude");
    const graphics = scene.add.graphics();
    this.graphics = graphics;
    this.graphics.alpha = 0;
    this.circle = new Phaser.Geom.Circle(params.x, params.y, 150)
    Dude.dudes.add(this);
  }

  updatePos(x: number, y: number) {
    super.updatePos(x, y);
    // this.closezone.setPosition(x, y)
  }
  updateAnimations() {
    this.sprite.anims.play("always", true);
    if (this.graphics.alpha > 0) {
      this.graphics.alpha -= .05
      this.updateGraphicsPosition();
    }
  }
  destroy() {
    Dude.dudes.delete(this);
    
    super.destroy();
    // this.closezone.destroy();
  }

  updateGraphicsPosition() {
    const centre = this.sprite.getCenter();
    this.graphics.clear();
    this.graphics.fillStyle(0xFF0000, 1)
    this.circle.setPosition(centre.x, centre.y)
    this.graphics.fillCircleShape(this.circle)

    // this.graphics.fillCircle(centre.x, centre.y, 150)
  }

  showCloseZone() {
    this.graphics.alpha = .5;
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
      const centre = dude.sprite.getCenter();
      const distance = Phaser.Math.Distance.BetweenPoints(pointer, centre);
      console.log(distance);
      
      if (distance < 150) {
        console.log("show close fucking zone");
        dude.showCloseZone();
        isIt = true;
      }
    }
    return isIt;
  }
}
