import "phaser";
import { gameCreateObject, GameScene, gameUpdateObject } from "./gameScene"
export default class GameObject {
  private _id: number
  get id() {
    return this._id
  }
  sprite: Phaser.GameObjects.Sprite

  constructor(scene: GameScene, params: gameCreateObject) {
    this._id = params.id
    
    this.sprite = scene.add.sprite(params.x, params.y, params.key);
    console.log(this.sprite);
    
  }
  updatePos(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  update(params: gameUpdateObject) {
    this.updatePos(params.x, params.y);
  }
  destroy() {
    this.sprite.destroy();
  }
}