import {
  PlatformDragging,
  PlatformDragStartOrEnd,
  userInputEvents,
} from "../interfaces/interfaces";
import GameObject from "../gameObject";
import userConnection from "../connection/userConnection";
import userConnectionManager from "../connection/userConnectionManager";

export default class PlatformServer extends GameObject {

  dragging = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, "ground", x, y);
  }



  dragTo(params: PlatformDragging) {
    this.setPosition(params.x, params.y);
  }


  destroyPlatform(connection: userConnection) {
    connection.send.destroyPlatform(this.id);
    super.destroy();
  }
}
