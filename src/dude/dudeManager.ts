import userConnection from "../connection/userConnection";
import { dudeFromServerEvents } from "../interfaces/dudeInterfaces";
import PlatformManager from "../platforms/platformManager";
import DudeServer from "./dudeServer";

export default class DudeManager {
  distanceBetweenDudes = 300;
  defaultYVelocity = 200;
  dudes: Phaser.Physics.Arcade.Group;
  startPlayerYPosition = 200;
  worldCenterX: number;
  gameStop: () => void;
  platformManager: PlatformManager;
  deadDudes = 0;

  add(connection: userConnection) {
    const newDude = new DudeServer(
      connection,
      this.getNewPositionForDude(),
      this
    );
    newDude.sendCreateEvent();

    this.dudes.children.each((dude: DudeServer) => {
      if (dude.id == newDude.id) {
        return;
      }
      let params = dude.getCreateParams();
      connection.send.createDude(params);
    });
    return newDude;
  }

  getNewPositionForDude() {
    let maxX = 0;
    this.dudes.children.each((dude: DudeServer) => {
      if (dude.body.x > maxX) {
        maxX = dude.body.x;
      }
    });
    if (maxX == 0) {
      maxX = this.worldCenterX;
    } else {
      maxX += this.distanceBetweenDudes;
    }
    return maxX;
  }

  constructor(
    group: Phaser.Physics.Arcade.Group,
    worldCenterX: number,
    platformManager: PlatformManager,
    gameStop: () => void
  ) {
    this.dudes = group;
    this.worldCenterX = worldCenterX;
    this.platformManager = platformManager;
    this.gameStop = gameStop;
  }

  startGame() {
    let xAxisOffset = 0;
    this.deadDudes = 0;
    this.dudes.children.each((dude: DudeServer) => {
      dude.gameStart(xAxisOffset);
      xAxisOffset += this.distanceBetweenDudes;
      this.platformManager.spawnPlatform(dude);
    });
  }

  update(delta: number) {
    const dudes = this.dudes.children.getArray() as DudeServer[];
    for (const dude of dudes) {
      dude.updateDude();
    }
    this.platformManager.update(delta, dudes);
  }

  getDudeServer(id: number) {
    const dudes = this.dudes.children.getArray() as DudeServer[];
    for (const dude of dudes) {
      if (dude.id == id) {
        return dude;
      }
    }
    throw new Error(`dude ${id} not found`);
  }

  onSomeoneDie() {
    if (this.countAlive() < 2) {
      console.log("game end");
      let aliveDude = this.dudes.getFirstAlive() as DudeServer;
      if (aliveDude) {
        console.log("SOME ONE WIN");
        aliveDude.youWin();
      }

      this.gameStop();
      return;
    }
    this.softArrangeDudes()
  }
  softArrangeDudes() {
    let dudes = this.dudes.children.getArray();
    let aliveDudes: DudeServer[] = [];
    for (const dudeId in dudes) {
      if (Object.prototype.hasOwnProperty.call(dudes, dudeId)) {
        const dude = dudes[dudeId];
        if(dude.active) {
          aliveDudes.push(dude as DudeServer);
        }
      }
    }

    aliveDudes.sort((a, b) => {return a.xAxis - b.xAxis})
    let xAxis = this.worldCenterX;
    for (const dude of aliveDudes) {
      dude.setNewX(xAxis);
      xAxis += this.distanceBetweenDudes;
    }
  }
  countAlive() {
    let count = 0;
    this.dudes.children.each((gmObj) => {
      if (gmObj.active) {
        count++;
      }
    });
    console.log("count Alive = " + count);

    return count;
  }

  gameEnd() {
    this.arrangeDudesAndStop();
  }

  arrangeDudesAndStop() {
    let xAxis = this.worldCenterX;
    this.dudes.children.each((dude: DudeServer) => {
      dude.setVelocity(0, 0);
      dude.setXAxisWithoutMoveToPosition(xAxis);
      dude.setPosition(xAxis, this.startPlayerYPosition);
      xAxis += this.distanceBetweenDudes;
      dude.setActive(true);
      dude.updateDude();
    });
  }

  imDeadGetMyScore() {
    const totalDudes = this.dudes.getLength();
    const score = totalDudes - this.deadDudes;
    this.deadDudes++;
    return score;
  }
}
