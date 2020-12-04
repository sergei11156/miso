import { Physics } from "phaser";
import {
  PlatformDragging,
  PlatformDragStartOrEnd,
  userInputEvents,
} from "../interfaces";
import DudeServer from "./dudeServer";
import { GameScene } from "./gameScene";

export default class PlatformServer {
  static platforms: Phaser.Physics.Arcade.Group;
  static platformTimer: number = 0;
  static io: any;
  static platformsServer: PlatformServer[] = [];

  static update(delta: number, dude: DudeServer) {
    this.platformTimer += delta;
    if (this.platformTimer > 2000) {
      this.platformTimer = 0;
      this.spawnPlatform(dude);
    }
  }

  private _id: number;
  get id() {
    return this._id;
  }
  sprite: Phaser.Physics.Arcade.Sprite;
  dragging = false;
  constructor(id: number, platform: Phaser.Physics.Arcade.Sprite) {
    PlatformServer.platformsServer.push(this);
    this._id = id;
    this.sprite = platform;
  }

  static init(io: any, platforms: Physics.Arcade.Group) {
    this.io = io;
    this.platforms = platforms

  }
  static getPlatformServer(id: number) {
    for (const platform of this.platformsServer) {
      if (platform.id == id) {
        return platform;
      }
    }
    throw new Error(`platform ${id} not found`);
  }

  static spawnPlatform(dude: DudeServer) {
    let playerBottomCenter = dude.sprite.getBottomCenter();

    let platformX = playerBottomCenter.x - Phaser.Math.Between(-400, 200);
    let platformY = playerBottomCenter.y + 800;
    let platform = this.platforms.create(platformX, platformY, "ground");
    const platformId = GameScene.getNewId();

    this.io.emit(userInputEvents.create, {
      key: "ground",
      id: platformId,
      x: platformX,
      y: platformY,
    });

    new PlatformServer(platformId, platform);
  }

  static dragStart(params: PlatformDragStartOrEnd, socket: SocketIO.Socket) {
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

  static dragEnd(params: PlatformDragStartOrEnd, socket: SocketIO.Socket) {
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

  static dragging(params: PlatformDragging, socket: SocketIO.Socket) {
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

  dragTo(params: PlatformDragging) {
    this.sprite.setPosition(params.x, params.y);
  }

  static clear() {
    this.platforms.clear(true, true);
    this.platformTimer = 0;
    this.platformsServer = [];
  }

}
