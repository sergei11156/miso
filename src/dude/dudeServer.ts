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
    this._xAxis = xAxis;
    this.connection = connection;
    this.dudeManager = dudeManager;
    dudeManager.dudes.add(this, true);
    this.body.setSize(32, 48);
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
    };
    return params;
  }

  updateDude() {
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
    this.setActive(false);
    console.log(this.id);

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

    this.connection.send.die(oldId);
    this.dudeManager.onSomeoneDie();
  }

  youWin() {
    this.connection.send.win();
    // this.socket.emit(userInputEvents.win);
  }
}
