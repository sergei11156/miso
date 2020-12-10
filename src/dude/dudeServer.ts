import GameObject from "../gameObject";
import {
  die,
  gameCreateObject,
  gameUpdateObject,
  userInputEvents,
  youDie,
} from "../interfaces/interfaces";
import "phaser";
import DudeManager from "./dudeManager";
import { createDude, dudeFromServerEvents } from "../interfaces/dudeInterfaces";
import userConnection from "../connection/userConnection";

export default class DudeServer extends GameObject {
  private _xAxis: number;
  dudeManager: DudeManager;
  connection: userConnection;
  get xAxis() {
    return this._xAxis;
  }
  constructor(
    connection: userConnection,
    xAxis: number,
    dudeManager: DudeManager
  ) {
    super(
      dudeManager.dudes.scene,
      "dude",
      xAxis,
      dudeManager.startPlayerYPosition
    );
    this.setActive(false);
    this._xAxis = xAxis;
    this.connection = connection;
    this.dudeManager = dudeManager;
    connection.setDude(this)
    dudeManager.dudes.add(this, true);
    this.body.setSize(60, 48);
    this.setCollideWorldBounds(false);
  }

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
    this.connection.send.createDude(params);
    console.log("create emitted 11");

    params.cameraFollow = false;
    this.connection.send.createDude(params, true);
  }

  getCreateParams() {
    const center = this.getCenter();
    let params: createDude = {
      id: this.id,
      x: center.x,
      y: center.y,
      name: this.connection.userName
    };
    return params;
  }

  setNewX(xAxis: number) {
    this._xAxis = xAxis; 
    const dudeCoord = this.getCenter();
    const distance = xAxis - dudeCoord.x;
    const speed = distance / 10;
    
    this.setVelocityX(speed);
  }
  updateDude() {
    if (this.body.velocity.x != 0) {
      const centre = this.getCenter();
      if (this.xAxis - 3 > centre.x && centre.x < this.xAxis + 3) {
        this.setVelocityX(0);
      }
    }
    if (this.active) {
      const center = this.getCenter();
      const params: gameUpdateObject = {
        id: this.id,
        x: center.x,
        y: center.y,
      };
      this.connection.send.update(params);
    }
  }

  youDied() {
    const oldId = this.id;
    this.setVelocityY(0);
    this.setVelocityX(0);
    this.setActive(false);

    // const newId = DudeServer.dudes.getFirstAlive() as DudeServer;

    // const youDie: youDie = {
    //   id: oldId,
    // };
    // if (newId) {
    //   youDie.newFollowId = newId.id;
    // }
    // const dieData: die = { id: oldId };
    // this.socket.emit(userInputEvents.youDie, youDie);
    // this.socket.broadcast.emit(userInputEvents.die, dieData);
    let score = this.dudeManager.imDeadGetMyScore();
    this.connection.send.die(score);
    this.dudeManager.onSomeoneDie();
  }

  youWin() {
    this.setVelocityY(0);
    this.setVelocityX(0);
    this.setActive(false);
    
    this.connection.send.win();
    // this.socket.emit(userInputEvents.win);
  }

  setXAxisWithoutMoveToPosition(xAxis: number) {
    this._xAxis = xAxis;
  }
}
