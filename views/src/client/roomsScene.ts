import "phaser"
import { MiscoGame } from "./client";

export default class RoomsScene extends Phaser.Scene{
  constructor(){
    super({
      key: "roomsScene"
    })
  }

  preload() {
    
  }

  create() {
    console.log("loaded rooms scene");
    // const game = this.game as MiscoGame
    // const io = game.io

  }

  update(time: number, delta: number) {

  }
}
