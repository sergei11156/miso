import { PlatformDragging, PlatformDragStartOrEnd, userInputEvents } from "../interfaces/interfaces";
import DudeServer from "../dude/dudeServer";
import PlatformServer from "./PlatformServer";
import { platformCreate, platformEventsFromServer } from "../interfaces/platformInterfaces";
import { CreateContextOptions } from "vm";
import userConnection from "../connection/userConnection";

export default class PlatformManager {
  platforms: Phaser.Physics.Arcade.Group;
  platformTimer: number = 0;
  io: SocketIO.Server;
  yOffsetOfDude = 200;

  gameStarted: boolean = false;

  update(delta: number, dudes: DudeServer[]) {
    this.platformTimer += delta;
    if (this.platformTimer > 1000) {
      this.platformTimer = 0;
      for (const dude of dudes) {
        this.spawnPlatform(dude);
      }
    }
  }
  constructor(io: SocketIO.Server, platforms: Phaser.Physics.Arcade.Group) {
    this.io = io;
    this.platforms = platforms;
  }
  getPlatformServer(id: number) {
    let platforms = this.platforms.children.getArray() as PlatformServer[];
    for (const platform of platforms) {
      if (platform.id == id) {
        return platform;
      }
    }
    throw new Error(`platform ${id} not found`);
  }

  spawnPlatform(dude: DudeServer) {
    let playerBottomCenter = dude.getBottomCenter();
    const yOffset = this.yOffsetOfDude / 2;
    let platformX =
      playerBottomCenter.x - Phaser.Math.Between(-yOffset, yOffset);
    let platformY = playerBottomCenter.y + 800;

    let platformServer = new PlatformServer(this.platforms.scene, platformX, platformY);

    this.platforms.add(platformServer);
    platformServer.body.setSize(190, 65);
    
    const createPlatformParam: platformCreate = {
      id: platformServer.id,
      x: platformX,
      y: platformY,
    }
    this.io.emit(platformEventsFromServer.createPlatform, createPlatformParam);
  }

  dragStart(params: PlatformDragStartOrEnd, socket: SocketIO.Socket) {
    if (!this.gameStarted) return;

    try {
      let platformServer = this.getPlatformServer(params.id);
      if (platformServer.dragging) {
        throw new Error("platform already dragging");
      }
      platformServer.dragging = true;
      socket.broadcast.emit(userInputEvents.dragStart, params);
    } catch (error) {
      console.log(error);
    }
  }

  dragEnd(params: PlatformDragStartOrEnd, socket: SocketIO.Socket) {
    if (!this.gameStarted) return;
    try {
      let platformServer = this.getPlatformServer(params.id);
      if (!platformServer.dragging) {
        throw new Error("platform already not dragging");
      }
      platformServer.dragging = false;
      socket.broadcast.emit(userInputEvents.dragEnd, params);
    } catch (error) {
      console.log(error);
    }
  }

  dragging(params: PlatformDragging, socket: SocketIO.Socket) {
    if (!this.gameStarted) return;
    try {
      let platformServer = this.getPlatformServer(params.id);
      if (!platformServer.dragging) {
        throw new Error("platform already not dragging");
      }
      platformServer.dragTo(params);
      socket.broadcast.emit(userInputEvents.dragging, params);
    } catch (error) {
      console.log(error);
    }
  }
  clear() {
    this.platforms.clear(true, true);
    this.platformTimer = 0;
  }

  destroyPlatform(params: {id : number}, connection: userConnection) {
    try {
      const platform = this.getPlatformServer(params.id)
      platform.destroyPlatform(connection);
    } catch (error) {
      console.log(error);
    }
  }
}