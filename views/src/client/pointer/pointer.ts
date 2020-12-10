import { GameScene } from "../gameScene";

export default class PlayerPointer {
  pointer: Phaser.Physics.Arcade.Sprite;
  name: string;
  text: Phaser.GameObjects.Text;
  constructor(scene: GameScene, name: string) {
    this.pointer = scene.physics.add.sprite(0, 0, "pointer");
    this.name = name;
    this.text = scene.add.text(0, 0, name, {
      color: '#000000',
      fontFamily: "Arial, Helvetica, sans-serif"
    })
    this.pointer.alpha = .5;
    this.text.setDepth(5);
    this.pointer.setDepth(5);
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