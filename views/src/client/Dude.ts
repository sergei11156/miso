import { gameUpdateObject } from "./interfaces/interfaces"
import GameObject from "./gameObject"

export default class Dude extends GameObject{

  update(params: gameUpdateObject) {
    this.sprite.anims.play("always", true)
    super.update(params)
  }
}