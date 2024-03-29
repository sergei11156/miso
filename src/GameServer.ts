import "@geckos.io/phaser-on-nodejs";
import "phaser";
import { GameScene } from "./gameScene";
import Room from "./rooms/room";
import RoomManager from "./rooms/roomManager";

const worldWidth = 1000;
const worldHeight = 1e6;
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.HEADLESS,
  title: "misco",
  parent: "game",
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
  constructor(io: SocketIO.Server) {
    super(config);
    this.io = io;
    this.events.on("ready", () => {
      const roomManager = new RoomManager(io, (key, room) => {return this.createRoom(key, room)});
    })
  }

  createRoom(key: string, room: Room) {
    const scene = this.scene.add(key, GameScene, true, { io: this.io, key, room }) as GameScene;
    return scene;
  }
}
