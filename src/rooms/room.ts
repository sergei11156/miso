import { GameScene } from "../gameScene";
import { updateRoomData } from "../interfaces/roomInterfaces";
import { joinRoom } from "../interfaces/roomInterfaces";
import { roomFromServerEvents } from "../interfaces/roomInterfaces";

export default class Room {
  private _key: string;
  get key() {
    return this._key;
  }
  private playersCount: number = 0;
  private io: SocketIO.Server;
  private roomScene: GameScene; 

  constructor(io: SocketIO.Server, createRoom: (key: string) => GameScene) {
    this._key = this.makeKey(5);
    this.io = io;
    this.roomScene = createRoom(this.key);
    this.roomScene.setGameStateCallback(()=> {
      this.sendUpdateRoom();
    })
  }

  getRoomUpdateObject(): updateRoomData {
    return {
      key: this.key,
      players: this.playersCount,
      isWaiting: !this.roomScene.gameStarted
    };
  }

  addUser(socket: SocketIO.Socket) {
    if (this.roomScene.gameStarted) {
      return;
    }
    socket.leave("wait");
    socket.join(this.key);
    this.playersCount++;
    const joinObject: joinRoom = {
      key: this.key
    }
    socket.emit(roomFromServerEvents.youConnectedTo, joinObject)
    this.sendUpdateRoom();
    
    this.roomScene.newUserConnect(socket);

    socket.on("disconnect", () => {
      socket.leave(this._key);
      this.playersCount--;
      this.sendUpdateRoom();
    });
  }

  sendUpdateRoom() {
    this.io
      .to("wait")
      .emit(roomFromServerEvents.update, this.getRoomUpdateObject());
  }

  makeKey(length: number) {
    var result = "";
    var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
