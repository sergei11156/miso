import DudeServer from "./dudeServer";
import PlatformServer from "./PlatformServer";

export default class GameObject extends Phaser.Physics.Arcade.Sprite {
  private static _lastObjectId: number = 0;
  static get newId() {
    this._lastObjectId++;
    return this._lastObjectId;
  }

  _id: number;
  get id() {
    return this._id;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this._id = GameObject.newId;
  }
}
