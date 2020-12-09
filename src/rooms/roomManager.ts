import { GameScene } from "../gameScene";
import { clientEvents } from "../interfaces/interfaces";
import {
  joinRoom,
  roomFromClientEvents,
  roomFromServerEvents,
} from "../interfaces/roomInterfaces";
import Room from "./room";

export default class RoomManager {
  private rooms: Room[] = [];
  private io: SocketIO.Server;

  constructor(io: SocketIO.Server, createRoom: (key: string, room: Room) => GameScene) {
    this.io = io;
    this.createNewRoom(createRoom);
    this.createNewRoom(createRoom);
    this.createNewRoom(createRoom);

    io.on("connection", (socket: SocketIO.Socket) => {
      socket.join("wait");

      socket.on(clientEvents.init, () => {
        for (const room of this.rooms) {
          const roomUpdateObject = room.getRoomUpdateObject();
          socket.emit(roomFromServerEvents.update, roomUpdateObject);
        }
      });

      socket.on(roomFromClientEvents.join, (params: joinRoom) => {
        try {
          const room = this.getRoom(params.key);
          console.log(params.name);
          
          room.addUser(socket, params.name);
        } catch (error) {
          socket.emit(roomFromServerEvents.roomNotExist, params.key)
          console.error(error);
        }
      });
      socket.on(roomFromClientEvents.joinAnyRoom, (name: string) => {
        const len = this.rooms.length;
        const room = Phaser.Math.Between(0, len-1);
        this.rooms[room].addUser(socket, name);
      })
    });
  }

  createNewRoom(createRoom: (key: string, room: Room) => GameScene) {
    const room = new Room(this.io, createRoom);
    this.rooms.push(room);
  }

  getRoom(key: string) {
    for (const room of this.rooms) {
      if (room.key == key) {
        return room;
      }
    }
    throw new Error("room not found " + key);
  }
}
