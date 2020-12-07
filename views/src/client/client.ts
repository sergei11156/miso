import "phaser";
import { GameScene } from "./gameScene";
import RoomsScene from "./rooms/roomsScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    height: window.innerHeight,
    width: window.innerWidth,
  },
  title: "misco",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      debugShowBody: true,
      debugShowStaticBody: true,
      debugShowVelocity: true,
      debugBodyColor: 0xff00ff,
      debugStaticBodyColor: 0x0000ff,
      debugVelocityColor: 0x00ff00,
    },
  },
  backgroundColor: "#5DADE2"
};
export class MiscoGame extends Phaser.Game {
  io: SocketIOClient.Socket;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
    this.events.on("ready", ()=> {

      this.scene.add("roomsScene", RoomsScene, true)
    })
  }
}

window.onload = () => {
  let game = new MiscoGame(config);
};