import GameObject from "../gameObject";
import {
  die,
  gameCreateObject,
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "../interfaces/interfaces";
import PlatformServer from "../platforms/PlatformServer";
import "phaser";
import { GameScene } from "../gameScene";
import DudeManager from "./dudeManager";
import { createDude, dudeFromServerEvents } from "../interfaces/dudeInterfaces";

export default class DudeServer extends GameObject {
  
  socket: SocketIO.Socket;

  private _xAxis: number;
  dudeManager: DudeManager;

  

  gameStart(xAxisOffset: number) {
    this.setActive(true);
    const x = xAxisOffset + this.dudeManager.worldCenterX;
    this.setPosition(x, this.dudeManager.startPlayerYPosition);
    this.sendCreateEvent();
    this.setVelocityY(this.dudeManager.defaultYVelocity);
  }

  sendCreateEvent() {
    let params = this.getCreateParams();
    console.log(params);
    
    params.cameraFollow = true;
    this.socket.emit(dudeFromServerEvents.createDude, params);
    console.log("create emitted 11");
    
    params.cameraFollow = false;
    this.socket.broadcast.emit(dudeFromServerEvents.createDude, params);
  }

  getCreateParams() {
    let params: createDude = {
      id: this.id,
      x: this.body.x,
      y: this.body.y,
    };
    return params;
  }


  updateDude() {
    if (this.active) {
      const params: gameUpdateObject = {
        id: this.id,
        x: this.body.x,
        y: this.body.y,
      };
      console.log(params);
      
      this.dudeManager.io.emit(userInputEvents.update, params);
    }
  }



  constructor(socket: SocketIO.Socket, xAxis: number, dudeManager:DudeManager) {
    super(
      dudeManager.dudes.scene,
      "dude",
      xAxis,
      dudeManager.startPlayerYPosition
    );
    this._xAxis = xAxis;
    this.socket = socket;
    this.dudeManager = dudeManager;
    dudeManager.dudes.add(this, true);
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
    this.dudeManager.onSomeoneDie();
  }


  youWin() {
    this.socket.emit(userInputEvents.win);
  }


}
