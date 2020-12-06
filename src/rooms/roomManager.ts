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

  constructor(io: SocketIO.Server, createRoom: (key: string) => GameScene) {
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
          room.addUser(socket);
        } catch (error) {
          console.error(error);
        }
      });
    });
  }

  createNewRoom(createRoom: (key: string) => GameScene) {
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
