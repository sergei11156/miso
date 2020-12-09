import { GameScene } from "../gameScene";

export default class PlayerPointer {
  pointer: Phaser.Physics.Arcade.Sprite;
  name: string;
  text: Phaser.GameObjects.Text;
  constructor(scene: GameScene, name: string) {
    this.pointer = scene.physics.add.sprite(0, 0, "pointer");
    this.name = name;
    this.text = scene.add.text(0, 0, name)
    this.text.setColor("#FFFFFF")
    this.text.alpha = .5;
    this.text.setDepth(2);
  }

  updatePosition(x: number, y: number) {
    this.pointer.setPosition(x, y);
    let topCentre = this.pointer.getTopCenter();
    this.text.setPosition(topCentre.x - this.text.width/2, topCentre.y - 20);
  }

  removePointer() {
    this.pointer.destroy();
    this.text.destroy();
  }
}