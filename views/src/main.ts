import "phaser";
import { Scene } from "phaser";
import { GameScene } from "./ts/gameScene";
import socket_io from "socket.io-client";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,

    height: window.innerHeight,
    width: innerWidth,
  },
  title: "misco",
  parent: "game",
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      debugShowBody: true,
      debugShowStaticBody: true,
      debugShowVelocity: true,
      debugBodyColor: 0xff00ff,
      debugStaticBodyColor: 0x0000ff,
      debugVelocityColor: 0x00ff00,
      // x: 0,
      // y: 0,
      // width: 20000,
      // height: 1e6
    },
  },
  // height: 1e6,
  // width: 20000,
  backgroundColor: "#5DADE2",
};
export class MiscoGame extends Phaser.Game {
  io: SocketIOClient.Socket;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
    this.io = socket_io();
  }
}
// io.on("updatePlayerPosition",  function (params:any) {
//   console.log(params);
  
// })
window.onload = () => {
  let game = new MiscoGame(config);
};