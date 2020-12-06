import { gameUpdateObject } from "./interfaces/interfaces"
import GameObject from "./gameObject"
import { GameScene } from "./gameScene"
import { createDude } from "./interfaces/dudeInterfaces"

export default class Dude extends GameObject{

  static platformGroup: Phaser.Physics.Arcade.Group;
  constructor (scene: GameScene, params: createDude) {
    let group;
    if (Dude.platformGroup) {
      group = Dude.platformGroup
    } else {
      group = scene.physics.add.group();
    }
    super(scene, params.id, params.x, params.y, "dude", group)
  }
  update(params: gameUpdateObject) {
    this.sprite.anims.play("always", true)
    super.update(params)
  }
}