import GameObject from "./gameObject"
import { gameUpdateObject } from "./gameScene"

export default class Dude extends GameObject{

  update(params: gameUpdateObject) {
    this.sprite.anims.play("always", true)
    super.update(params)
  }
}