import { platform } from "os";
import { gameCreateObject, gameUpdateObject, userInputEvents } from "../interfaces";
import PlatformServer from "./PlatformServer";

export default class DudeServer {
  static distanceBetweenDudes = 300;
  static defaultYVelocity = 200;
  static dudesGroup: Phaser.Physics.Arcade.Group;
  static startPlayerYPosition = 200;
  static worldCenterX: number;
  sprite: Phaser.Physics.Arcade.Sprite;
  static dudes: DudeServer[] = [];
  static io: any;
  socket: SocketIO.Socket;
  private _id: number;
  get id() {
    return this._id;
  }
  private _xAxis: number;

  static add(id: number, socket: SocketIO.Socket) {
    const dude = new DudeServer(socket, id, this.worldCenterX);
    this.dudes.push(dude);

    return dude;
  }

  static init(
    io: any,
    group: Phaser.Physics.Arcade.Group,
    worldCenterX: number
  ) {
    this.io = io;
    this.dudesGroup = group;
    this.worldCenterX = worldCenterX;
  }

  static remove(id: number) {
    const dudeKey = this.getDudeServerKey(id);
    const dude = this.dudes[dudeKey];

    dude.destroy();

    this.dudes.splice(dudeKey, 1);
  }

  static startGame() {
    let xAxisOffset = 0;
    for (const dude of this.dudes) {
      dude.gameStart(xAxisOffset);
      xAxisOffset += this.distanceBetweenDudes;
      PlatformServer.spawnPlatform(dude);
    }
  }

  gameStart(xAxisOffset: number) {
    const x = xAxisOffset + DudeServer.worldCenterX;
    this.sprite.setPosition(x, DudeServer.startPlayerYPosition);
    let params: gameCreateObject = {
      key: "dude",
      id: this.id,
      x,
      y: DudeServer.startPlayerYPosition,
      cameraFollow: true,
    };
    this.socket.emit(userInputEvents.create, params);
    params.cameraFollow = false;
    this.socket.broadcast.emit(userInputEvents.create, params);
    this.sprite.setVelocityY(DudeServer.defaultYVelocity);
  }

  // static clear() {
  //   this.dudesGroup.clear(true, true);
  //   this.dudes = [];
  // }

  static update(delta: number) {
    for (const dude of this.dudes) {
      dude.updateDude()
    }
    PlatformServer.update(delta, this.dudes)
  }
  updateDude() {
    const params: gameUpdateObject = {
      id: this.id,
      x: this.sprite.body.x,
      y: this.sprite.body.y
    }
    DudeServer.io.emit(userInputEvents.update, params)
  }

  static getDudeServer(id: number) {
    for (const dude of this.dudes) {
      if (dude.id == id) {
        return dude;
      }
    }
    throw new Error(`dude ${id} not found`);
  }

  static getDudeServerKey(id: number) {
    for (const key in this.dudes) {
      if (Object.prototype.hasOwnProperty.call(this.dudes, key)) {
        const dude = this.dudes[key];
        if (dude.id == id) {
          return parseInt(key);
        }
      }
    }
    throw new Error(`dude ${id} not found`);
  }

  constructor(socket: SocketIO.Socket, id: number, xAxis: number) {
    this._id = id;
    this._xAxis = xAxis;
    this.socket = socket;
    this.sprite = DudeServer.dudesGroup.create(
      xAxis,
      DudeServer.startPlayerYPosition,
      "dude"
    );
    this.sprite.setCollideWorldBounds(false);
  }

  destroy() {
    this.sprite.destroy();
  }
}
