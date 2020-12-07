import { Scene } from "phaser";
import {
  gameCreateObject,
  PlatformDragging,
  PlatformDragStartOrEnd,
  userInputEvents,
} from "./interfaces/interfaces";
import GameObject from "./gameObject";
import { GameScene } from "./gameScene";
import { platformCreate, platformDragToCloseZone, platformEventsFromClient, platformEventsFromServer } from "./interfaces/platformInterfaces";
import Dude from "./Dude";

export interface draggingPlatform {
  id: number;
  x: number;
  y: number;
}

export default class Platform extends GameObject {

  static io: any;
  static platforms: Platform[] = [];
  static imDead: boolean = false;

  static add(scene: GameScene, params: platformCreate, group: Phaser.Physics.Arcade.Group): any {
    let platform = new Platform(scene, params, this.io);
    this.platforms.push(platform);
    // group.add(platform.sprite);
    // platform.sprite.setMass(0.01);

    // platform.sprite.setCircle(100);
    return platform;
  }

  static init(_io: any) {
    this.io = _io;
    this.io.on(userInputEvents.dragStart, (params: PlatformDragStartOrEnd) => {
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
    this.io.on(platformEventsFromServer.destroyPlatform, (params: { id: number}) => {
      try {
        let platform = this.getPlatform(params.id);
        platform.destroy();
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
    params: platformCreate,
    io: SocketIOClient.Socket
  ) {
    super(scene, params.id, params.x, params.y, "ground");
    this.sprite.setInteractive();
    scene.input.setDraggable(this.sprite);

    this.sprite.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      if (this.dragging || Platform.imDead) {
        return;
      }

      if (this.checkIsPointerIsInCloseZone(pointer)) {
        return;
      }

      this.startDragging();

      const dragStart: PlatformDragStartOrEnd = {
        id: this.id,
      };
      io.emit(userInputEvents.dragStart, dragStart);
      console.log(dragStart);
    });

    this.sprite.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if(Platform.imDead) return;
      if (this.checkIsPointerIsInCloseZone(pointer)) {
        this.whenDraggedToCloseZone();
        return;
      }
      this.dragTo(dragX, dragY);

      const dragNewPos: PlatformDragging = {
        id: this.id,
        x: this.sprite.x,
        y: this.sprite.y,
      };

      io.emit(userInputEvents.dragging, dragNewPos);
    });

    this.sprite.on("dragend", () => {
      this.stopDragging();
      io.emit(userInputEvents.dragEnd, { id: this.id });
    });
  }

  checkIsPointerIsInCloseZone(pointer: Phaser.Input.Pointer) {
      const pointerPosition = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      const isPointerInCloseZone = Dude.isPointerInCloseZone(pointerPosition)
      return isPointerInCloseZone;

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

  whenDraggedToCloseZone() {
    // this.imNotInteractive = true;
    this.destroy();
    const params: platformDragToCloseZone = {
      id: this.id
    }
    Platform.io.emit(platformEventsFromClient.platformDragToCloseZone, params)
  }
  static getPlatform(id: number) {
    for (const platform of this.platforms) {
      if (platform.id == id) {
        return platform;
      }
    }
    throw new Error("platform not found");
  } 
  
  static reset() {
    this.platforms = [];

  }
}
