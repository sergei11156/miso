import { Scene } from "phaser";
import {
  gameCreateObject,
  PlatformDragging,
  PlatformDragStartOrEnd,
  userInputEvents,
} from "../interfaces";
import GameObject from "./gameObject";
import { GameScene } from "./gameScene";

export interface draggingPlatform {
  id: number;
  x: number;
  y: number;
}

export default class Platform extends GameObject {
  static io: any;
  static platforms: Platform[] = [];
  static imDead: boolean = false;

  static add(scene: GameScene, params: gameCreateObject): any {
    let platform = new Platform(scene, params, this.io);
    this.platforms.push(platform);
    return platform;
  }

  static init(_io: any) {
    this.io = _io;
    this.io.on(userInputEvents.dragStart, (params: PlatformDragStartOrEnd) => {
      if (Platform.imDead) {
        return
      }
      try {
        let platform = this.getPlatform(params.id);
        if (platform.dragging) {
          throw new Error("Platform already dragging on client side");
        }

        platform.startDragging();
      } catch (error) {
        console.error(error);
      }
    });

    this.io.on(userInputEvents.dragEnd, (params: PlatformDragStartOrEnd) => {
      if (Platform.imDead) {
        return
      }
      try {
        let platform = this.getPlatform(params.id);
        if (!platform.dragging) {
          throw new Error("Platform not dragging on client side");
        }

        platform.stopDragging();
      } catch (error) {
        console.error(error);
      }
    });

    this.io.on(userInputEvents.dragging, (params: PlatformDragging) => {
      if (Platform.imDead) {
        return
      }
      try {
        let platform = this.getPlatform(params.id);
        if (!platform.dragging) {
          throw new Error("Platform not dragging on client side");
        }

        platform.dragTo(params.x, params.y);
      } catch (error) {
        console.error(error);
      }
    });
  }

  private _dragging = false;
  get dragging() {
    return this._dragging;
  }

  constructor(
    scene: GameScene,
    params: gameCreateObject,
    io: SocketIOClient.Socket
  ) {
    super(scene, params);
    this.sprite.setInteractive();
    scene.input.setDraggable(this.sprite);

    this.sprite.on("dragstart", (pointer: any) => {
      if (this.dragging) {
        return;
      }
      this.startDragging();

      const dragStart: PlatformDragStartOrEnd = {
        id: this.id,
      };
      io.emit(userInputEvents.dragStart, dragStart);
      console.log(dragStart);
    });

    this.sprite.on(
      "drag",
      (pointer: any, dragX: number, dragY: number) => {
        // console.log("drag event x: " + dragX + " drag y: " + dragY);
        
        this.dragTo(dragX, dragY);

        const dragNewPos: PlatformDragging = {
          id: this.id,
          x: this.sprite.x,
          y: this.sprite.y,
        };

        io.emit(userInputEvents.dragging, dragNewPos);
      }
    );

    this.sprite.on("dragend", () => {
      this.stopDragging();
      io.emit(userInputEvents.dragEnd, { id: this.id });
    });
  }

  dragTo(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }
  startDragging() {
    this._dragging = true;
    this.sprite.setTint(0xff0000);
  }
  stopDragging() {
    this._dragging = false;
    this.sprite.clearTint();
  }

  static getPlatform(id: number) {
    for (const platform of this.platforms) {
      if (platform.id == id) {
        return platform;
      }
    }
    throw new Error("platform not found");
  }
}
