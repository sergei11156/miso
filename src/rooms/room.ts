import userConnection from "../connection/userConnection";
import { GameScene } from "../gameScene";
import { updateRoomData, youConnectedTo } from "../interfaces/roomInterfaces";
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

  addUser(socket: SocketIO.Socket, name: string) {
    if (this.roomScene.gameStarted) {
      return;
    }
    socket.leave("wait");
    socket.join(this.key);
    this.playersCount++;
    const joinObject: youConnectedTo = {
      key: this.key
    }
    socket.emit(roomFromServerEvents.youConnectedTo, joinObject)
    this.sendUpdateRoom();
    
    this.roomScene.newUserConnect(socket, name);
    this.checkIfRoomCanStart();
    socket.on("disconnect", () => {
      socket.leave(this._key);
      this.playersCount--;
      this.sendUpdateRoom();
      this.checkIfRoomCanStart();
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

  checkIfRoomCanStart() {
    if (this.playersCount < 2) return;

    let howManyReadyPlayers = 0;
    for (const connection of this.roomScene.userConnectionManager.connections) {
      if (connection.ready) howManyReadyPlayers++;
    }

    if (this.playersCount/2 < howManyReadyPlayers) {
      this.roomScene.forceGameStartTimerOn();
    } else {
      this.roomScene.forceGameStartTimerOff();
    }
  }
}
