import GameObject from "./gameObject";
import {
  die,
  gameCreateObject,
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "./interfaces/interfaces";
import PlatformServer from "./PlatformServer";
import "phaser";
import { GameScene } from "./gameScene";

export default class DudeServer extends GameObject {
  static distanceBetweenDudes = 300;
  static defaultYVelocity = 200;
  static dudes: Phaser.Physics.Arcade.Group;
  static startPlayerYPosition = 200;
  static worldCenterX: number;
  static io: any;
  socket: SocketIO.Socket;

  private _xAxis: number;

  static add(socket: SocketIO.Socket) {
    const newDude = new DudeServer(socket, this.getNewPositionForDude());
    newDude.sendCreateEvent();

    this.dudes.children.each((dude: DudeServer) => {
      if (dude.id == newDude.id) {
        return;
      }
      let params = dude.getCreateParams();
      socket.emit(userInputEvents.create, params);
    });
    return newDude;
  }

  static getNewPositionForDude() {
    let maxX = 0;
    this.dudes.children.each((dude: DudeServer) => {
      if (dude.body.x > maxX) {
        maxX = dude.body.x;
      }
    });
    if (maxX == 0) {
      maxX = this.worldCenterX;
    } else {
      maxX += this.distanceBetweenDudes;
    }
    return maxX;
  }
  static init(
    io: any,
    group: Phaser.Physics.Arcade.Group,
    worldCenterX: number
  ) {
    this.io = io;
    this.dudes = group;
    this.worldCenterX = worldCenterX;
  }

  static startGame() {
    let xAxisOffset = 0;
    this.dudes.children.each((dude: DudeServer) => {
      dude.gameStart(xAxisOffset);
      xAxisOffset += this.distanceBetweenDudes;
      PlatformServer.spawnPlatform(dude);
    });
  }

  gameStart(xAxisOffset: number) {
    this.setActive(true);
    const x = xAxisOffset + DudeServer.worldCenterX;
    this.setPosition(x, DudeServer.startPlayerYPosition);
    this.sendCreateEvent();
    this.setVelocityY(DudeServer.defaultYVelocity);
  }

  sendCreateEvent() {
    let params = this.getCreateParams();

    params.cameraFollow = true;
    this.socket.emit(userInputEvents.create, params);

    params.cameraFollow = false;
    this.socket.broadcast.emit(userInputEvents.create, params);
  }

  getCreateParams() {
    let params: gameCreateObject = {
      key: "dude",
      id: this.id,
      x: this.body.x,
      y: this.body.y,
    };
    return params;
  }

  static update(delta: number) {
    const dudes = this.dudes.children.getArray() as DudeServer[];
    for (const dude of dudes) {
      dude.updateDude();
    }
    PlatformServer.update(delta, dudes);
  }
  updateDude() {
    if (this.active) {
      const params: gameUpdateObject = {
        id: this.id,
        x: this.body.x,
        y: this.body.y,
      };
      DudeServer.io.emit(userInputEvents.update, params);
    }
  }

  static getDudeServer(id: number) {
    const dudes = this.dudes.children.getArray() as DudeServer[];
    for (const dude of dudes) {
      if (dude.id == id) {
        return dude;
      }
    }
    throw new Error(`dude ${id} not found`);
  }

  constructor(socket: SocketIO.Socket, xAxis: number) {
    super(
      DudeServer.dudes.scene,
      "dude",
      xAxis,
      DudeServer.startPlayerYPosition
    );
    this._xAxis = xAxis;
    this.socket = socket;
    DudeServer.dudes.add(this, true);
    this.body.setSize(32, 48);
    this.setCollideWorldBounds(false);
  }

  youDied() {
    const oldId = this.id;
    this.setVelocityY(0);
    this.setActive(false);
    console.log(this.id);

    // const newId = DudeServer.dudes.getFirstAlive() as DudeServer;

    const youDie: youDie = {
      id: oldId,
    };
    // if (newId) {
    //   youDie.newFollowId = newId.id;
    // }
    const dieData: die = { id: oldId };
    this.socket.emit(userInputEvents.youDie, youDie);
    this.socket.broadcast.emit(userInputEvents.die, dieData);
    DudeServer.onSomeoneDie();
  }

  static onSomeoneDie() {
    if (this.countAlive() < 2) {
      console.log("game end");
      let aliveDude = this.dudes.getFirstAlive() as DudeServer;
      if (aliveDude) {
        console.log("SOME ONE WIN");
        aliveDude.youWin();
      }

      (this.dudes.scene as GameScene).gameStop();
    }
  }
  youWin() {
    this.socket.emit(userInputEvents.win);
  }

  static countAlive() {
    let count = 0;
    this.dudes.children.each((gmObj) => {
      if (gmObj.active) {
        count++;
      }
    });
    return count;
  }

  static gameEnd() {
    this.arrangeDudesAndStop();
  }

  static arrangeDudesAndStop() {
    let xAxis = this.worldCenterX;
    this.dudes.children.each((dude: DudeServer) => {
      dude.setVelocity(0);
      dude.setPosition(xAxis, this.startPlayerYPosition);
      xAxis += this.distanceBetweenDudes;
      dude.updateDude();
    });
  }
}
