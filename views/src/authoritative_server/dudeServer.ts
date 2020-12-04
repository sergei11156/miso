import { platform } from "os";
import GameObject from "./gameObject";
import {
  die,
  gameCreateObject,
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "../interfaces";
import PlatformServer from "./PlatformServer";
import { Scene } from "phaser";
import { GameScene } from "./gameScene";

export default class DudeServer extends GameObject{
  static distanceBetweenDudes = 300;
  static defaultYVelocity = 200;
  static dudes: Phaser.Physics.Arcade.Group;
  static startPlayerYPosition = 200;
  static worldCenterX: number;
  static io: any;
  socket: SocketIO.Socket;
  
  private _xAxis: number;

  static add(socket: SocketIO.Socket) {
    const dude = new DudeServer(socket, this.worldCenterX);

    return dude;
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
    const dudes = this.dudes.children.getArray() as DudeServer[];
    
    for (const dude of dudes) {
      dude.gameStart(xAxisOffset);
      xAxisOffset += this.distanceBetweenDudes;
      PlatformServer.spawnPlatform(dude);
    }
  }

  gameStart(xAxisOffset: number) {
    this.setActive(true);
    const x = xAxisOffset + DudeServer.worldCenterX;
    this.setPosition(x, DudeServer.startPlayerYPosition);

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
    this.setVelocityY(DudeServer.defaultYVelocity);
  }

  // static clear() {
  //   this.dudesGroup.clear(true, true);
  //   this.dudes = [];
  // }

  static update(delta: number) {
    // if (this.dudes.length == 1) {
    //   this.dudes[0].win()

    // }
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
    super(DudeServer.dudes.scene, xAxis, DudeServer.startPlayerYPosition, "dude")
    this._xAxis = xAxis;
    this.socket = socket;
    DudeServer.dudes.add(this, true);
    this.setCollideWorldBounds(false);
  }

  youDied() {
    this.setVelocityY(0);
    this.setActive(false);
    console.log(this.id);
    
    const newId = DudeServer.dudes.getFirstAlive() as DudeServer;
    const youDie: youDie = {
      id: this.id,
      newFollowId: newId.id
    }
    const dieData:die = { id: this.id }
    this.socket.emit(userInputEvents.youDie, youDie)
    this.socket.broadcast.emit(userInputEvents.die, dieData)
    DudeServer.onSomeoneDie()
  }

  static onSomeoneDie() {
    if (this.countAlive() < 2) {
      console.log("game end");
      this.dudes.scene.physics.pause();
      
      // (this.dudes.scene as GameScene).restartGame()
    }
  }

  static countAlive() {
    let count = 0;
    this.dudes.children.each((gmObj) => {
      if(gmObj.active) {
        count++
      }
    })
    return count;
  }
}
