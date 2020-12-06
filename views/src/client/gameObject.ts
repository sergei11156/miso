import "phaser";
import { gameCreateObject, gameUpdateObject } from "./interfaces/interfaces";
import { GameScene } from "./gameScene";
import { createDude } from "./interfaces/dudeInterfaces";
export default class GameObject {
  private _id: number;
  get id() {
    return this._id;
  }
  sprite: Phaser.GameObjects.Sprite;

  constructor(
    scene: GameScene,
    id: number,
    x: number,
    y: number,
    key: string,
    group: Phaser.Physics.Arcade.Group
  ) {
    this._id = id;
    this.sprite = scene.add.sprite(x, y, key);
    group.add(this.sprite)
  }
  updatePos(x: number, y: number) {
    this.sprite.setPosition(x, y)
  }

  update(params: gameUpdateObject) {
    this.updatePos(params.x, params.y);
  }
  destroy() {
    this.sprite.destroy();
  }
}
