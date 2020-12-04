import "phaser";
import socket_io from "socket.io-client";
import { GameScene } from "./gameScene";

const worldWidth = 1000;
const worldHeight = 1e6;
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.HEADLESS,
  title: "misco",
  parent: "game",
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: {y: 0, x: 0},
    }
  },
  height: worldHeight,
  width: worldWidth,
  fps: {
    target: 60
  },
  autoFocus: false
};

export class MiscoGame extends Phaser.Game {
  // worldWidth = worldWidth
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

let game = new MiscoGame(config);

