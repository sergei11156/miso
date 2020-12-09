import { GameScene } from "../gameScene";
import { gameSceneFromServer, updatePointerPosition } from "../interfaces/gameSceneInterfaces";
import PlayerPointer from "./pointer";

export default class PointerManager{
  scene: GameScene;
  io: SocketIOClient.Socket;
  pointers: {[id: number]: PlayerPointer} = {}
  constructor(scene: GameScene, io: SocketIOClient.Socket) {
    this.scene = scene;
    this.io = io;

    this.io.on(gameSceneFromServer.createPointer, (params: {id: number, name: string})=>{
      console.log("create pointer");
      
      this.createPointer(params.id, params.name);
    })
    this.io.on(gameSceneFromServer.removePointer, (id: number)=>{
      if (this.pointers.hasOwnProperty(id)) {
        this.pointers[id].removePointer();
        delete this.pointers[id];
      }
    })
    this.io.on(gameSceneFromServer.updatePointer, (params: updatePointerPosition) => {
      if (this.pointers.hasOwnProperty(params.id)) {
        this.pointers[params.id].updatePosition(params.x, params.y)
      }
    })
  }

  private createPointer(id: number, name: string) {
    if (id in this.pointers) {
      console.error("pointer already exist");
    } else {
      this.pointers[id] = new PlayerPointer(this.scene, name);
    }
  }
}