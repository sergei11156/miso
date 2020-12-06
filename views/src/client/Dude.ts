import { gameUpdateObject } from "./interfaces/interfaces"
import GameObject from "./gameObject"
import { GameScene } from "./gameScene"
import { createDude } from "./interfaces/dudeInterfaces"

export default class Dude extends GameObject{

  constructor (scene: GameScene, params: createDude) {
    super(scene, params.id, params.x, params.y, "dude")
  }
  update(params: gameUpdateObject) {
    this.sprite.anims.play("always", true)
    super.update(params)
  }
}