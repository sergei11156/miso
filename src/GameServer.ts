import "@geckos.io/phaser-on-nodejs";
import "phaser";
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
      gravity: { y: 0, x: 0 },
    },
  },
  height: worldHeight,
  width: worldWidth,
  fps: {
    target: 60,
  },
  autoFocus: false,
};
export default class GameServer extends Phaser.Game {
  io: SocketIO.Server;
  private gameRooms: SocketIO.Server;
  constructor(io: SocketIO.Server) {
    super(config);
    this.io = io;
  }
}
