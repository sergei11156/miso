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
export default class RoomsScene extends Phaser.Scene {
  private io: SocketIOClient.Socket;
  private rooms: { [key: string]: Room } = {};
  private lastObjectYPositions: number;
  private textSpawnPositionX: number;
  isRoomsEventsAreWork: boolean = true;
  inputNameContainer: HTMLDivElement;
  inputName: HTMLInputElement;

  init(params: { io: SocketIOClient.Socket }) {
    this.io = params.io;
    this.lastObjectYPositions = this.cameras.main.centerY;
    this.textSpawnPositionX = this.cameras.main.centerX;
    this.inputNameContainer = document.querySelector(".nameInput");
    this.inputName = document.getElementById("inputYourName") as HTMLInputElement;
  }
  preload() {}

  create() {
    console.log("loaded rooms scene");
    this.io.on(roomFromServerEvents.update, (params: updateRoomData) => {
      this.updateRoom(params);
    });

    this.io.emit(clientEvents.init);

    this.io.on(roomFromServerEvents.youConnectedTo, (params: joinRoom) => {
      console.log("EEEEEEEE IM JOINED TO " + params.key);
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
        this,
        this.textSpawnPositionX,
        this.lastObjectYPositions,
        params.key,
        params.players,
        params.isWaiting,
        (key) => this.joinRoom(key)
      );
      this.rooms[params.key] = room;

      this.add.existing(room);
      this.lastObjectYPositions += room.height + 20;
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

  openGameScene() {
    this.isRoomsEventsAreWork = false;
    this.inputNameContainer.style.display = "none";
    this.scene.add("gameScene", GameScene, true, { io: this.io });
    this.scene.remove("roomsScene");
  }
}
