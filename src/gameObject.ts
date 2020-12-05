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
  private _key: string;
  get key() {
    return this._key;
  }
  constructor(
    scene: Phaser.Scene,
    key: string,
    x: number,
    y: number,
    frame?: string | number
  ) {
    super(scene, x, y, "texture", frame);
    this._id = GameObject.newId;
    this._key = key;
  }
}
