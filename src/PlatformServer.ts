import {
  PlatformDragging,
  PlatformDragStartOrEnd,
  userInputEvents,
} from "./interfaces";
import DudeServer from "./dudeServer";
import GameObject from "./gameObject";

export default class PlatformServer extends GameObject {
  static platforms: Phaser.Physics.Arcade.Group;
  static platformTimer: number = 0;
  static io: SocketIO.Server;
  static yOffsetOfDude = 200;
  dragging = false;
  static gameStarted: boolean = false;

  static update(delta: number, dudes: DudeServer[]) {
    this.platformTimer += delta;
    if (this.platformTimer > 1000) {
      this.platformTimer = 0;
      for (const dude of dudes) {
        this.spawnPlatform(dude);
      }
    }
  }

  constructor(x: number, y: number) {
    super(PlatformServer.platforms.scene, "ground", x, y);
  }

  static init(io: SocketIO.Server, platforms: Phaser.Physics.Arcade.Group) {
    this.io = io;
    this.platforms = platforms;
  }
  static getPlatformServer(id: number) {
    let platforms = this.platforms.children.getArray() as PlatformServer[];
    for (const platform of platforms) {
      if (platform.id == id) {
        return platform;
      }
    }
    throw new Error(`platform ${id} not found`);
  }

  static spawnPlatform(dude: DudeServer) {
    let playerBottomCenter = dude.getBottomCenter();
    const yOffset = this.yOffsetOfDude / 2;
    let platformX =
      playerBottomCenter.x - Phaser.Math.Between(-yOffset, yOffset);
    let platformY = playerBottomCenter.y + 800;

    let platformServer = new PlatformServer(platformX, platformY);

    this.platforms.add(platformServer);
    platformServer.body.setSize(150, 66);
    this.io.emit(userInputEvents.create, {
      key: "ground",
      id: platformServer.id,
      x: platformX,
      y: platformY,
    });
  }

  static dragStart(params: PlatformDragStartOrEnd, socket: SocketIO.Socket) {
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

  static dragEnd(params: PlatformDragStartOrEnd, socket: SocketIO.Socket) {
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

  static dragging(params: PlatformDragging, socket: SocketIO.Socket) {
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

  dragTo(params: PlatformDragging) {
    this.setPosition(params.x, params.y);
  }

  static clear() {
    this.platforms.clear(true, true);
    this.platformTimer = 0;
  }
}
