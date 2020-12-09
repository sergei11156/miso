import "phaser";
import Room from "./room";
import {
  joinRoom,
  roomFromClientEvents,
  roomFromServerEvents,
  updateRoomData,
} from "../interfaces/roomInterfaces";
import { clientEvents } from "../interfaces/interfaces";
import { GameScene } from "../gameScene";
import socket_io from "socket.io-client";

export default class RoomsScene extends Phaser.Scene {
  private io: SocketIOClient.Socket;
  private rooms: { [key: string]: Room } = {};
  private lastObjectYPositions: number;
  private textSpawnPositionX: number;
  isRoomsEventsAreWork: boolean = true;
  inputNameContainer: HTMLDivElement;
  inputName: HTMLInputElement;
  submitButton: HTMLFormElement;
  roomName: string;
  inputNameOfRoom: HTMLInputElement;

  init() {
    this.io = socket_io();
    this.lastObjectYPositions = this.cameras.main.centerY;
    this.textSpawnPositionX = this.cameras.main.centerX;
    this.submitButton = document.querySelector(".startScreenContainer form");
    console.log(this.submitButton);
    this.submitButton.addEventListener("submit", () => {
      this.joinSomeRoom();
    })
    this.inputNameContainer = document.querySelector(".startScreenContainer");
    this.inputNameContainer.style.display = "flex";
    this.inputName = document.getElementById("inputYourName") as HTMLInputElement;
    this.inputNameOfRoom = document.getElementById("inputNameOfRoom") as HTMLInputElement;
    this.io.on(roomFromServerEvents.roomNotExist, (name: string) => {
      this.inputNameOfRoom.setCustomValidity("Комнаты " + name + " не существует!");
      this.submitButton.requestSubmit();
    })
    this.inputNameOfRoom.addEventListener("input", () => this.inputNameOfRoom.setCustomValidity(""))
  }
  joinSomeRoom() {
    if(this.inputNameOfRoom.value) {
      console.log(this.inputNameOfRoom);
      this.joinRoom(this.inputNameOfRoom.value);
      return;
    }
    this.joinAnyRoom();
  }
  preload() {}

  create() {
    console.log("loaded rooms scene");
    this.io.on(roomFromServerEvents.update, (params: updateRoomData) => {
      this.updateRoom(params);
    });

    this.io.emit(clientEvents.init);

    this.io.on(roomFromServerEvents.youConnectedTo, (params: joinRoom) => {
      this.roomName = params.key;
      this.openGameScene();
    });
  }

  updateRoom(params: updateRoomData) {
    if (!this.isRoomsEventsAreWork) {
      return;
    }
    if (params.key in this.rooms) {
      const room = this.rooms[params.key];
      room.newData(params);
    } else {
      const room = new Room(
        // this,
        // this.textSpawnPositionX,
        // this.lastObjectYPositions,
        params.key,
        params.players,
        params.isWaiting,
        (key) => this.joinRoom(key)
      );
      this.rooms[params.key] = room;

      // this.add.existing(room);
      // this.lastObjectYPositions += room.height + 20;
    }
  }

  joinRoom(key: string): void {
    const name = this.inputName.value;
    
    const joinParams: joinRoom = {
      key,
      name
    };
    this.io.emit(roomFromClientEvents.join, joinParams);
  }
  joinAnyRoom(): void {
    const name = this.inputName.value;
    this.io.emit(roomFromClientEvents.joinAnyRoom, name);
  }
  openGameScene() {
    this.isRoomsEventsAreWork = false;
    this.inputNameContainer.style.display = "none";
    this.scene.add("gameScene", GameScene, true, { io: this.io, roomName: this.roomName });
    this.scene.remove("roomsScene");
  }
}
