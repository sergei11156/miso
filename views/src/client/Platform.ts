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
  static defaultYOffset = 60;
  static defaultXOffset = 5;

  private _dragging = false;
  graphics: Phaser.GameObjects.Graphics;
  get dragging() {
    return this._dragging;
  }
  private draggingOnServerSide: boolean = false;

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
        platform.draggingOnServerSide = true;
        platform.graphics.clear();
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

        platform.draggingOnServerSide = false;
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

        platform.dragTo(params.x - Platform.defaultXOffset, params.y - Platform.defaultYOffset);
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



  constructor(
    scene: GameScene,
    params: platformCreate,
    io: SocketIOClient.Socket
  ) {
    super(scene, params.id, params.x - Platform.defaultXOffset, params.y - Platform.defaultYOffset, "fire");
    this.sprite.setInteractive();
    scene.input.setDraggable(this.sprite);


    const graphics = scene.add.graphics();
    this.graphics = graphics;

    this.sprite.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      this.graphics.clear();
      if (this.draggingOnServerSide || this.dragging || Platform.imDead) {
        return;
      }
      if (this.checkIsPointerIsInCloseZone(pointer)) {
        return;
      }
      const platformXY = this.sprite.getTopLeft();
      this.graphics.fillStyle(0x00FF00, .5)
      this.graphics.fillRect(platformXY.x, platformXY.y, this.sprite.width, this.sprite.height);
    });

    this.sprite.on("pointerout", () => {
      this.graphics.clear();
    });

    this.sprite.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      if (this.dragging || Platform.imDead || this.draggingOnServerSide) {
        return;
      }

      if (this.checkIsPointerIsInCloseZone(pointer)) {
        return;
      }
      this.graphics.clear();
      this.startDragging();

      const dragStart: PlatformDragStartOrEnd = {
        id: this.id,
      };
      io.emit(userInputEvents.dragStart, dragStart);
      console.log(dragStart);
    });

    this.sprite.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if(!this.dragging || this.draggingOnServerSide) return;
      if(Platform.imDead) return;
      if (this.checkIsPointerIsInCloseZone(pointer)) {
        this.whenDraggedToCloseZone();
        return;
      }
      this.dragTo(dragX, dragY);

      const dragNewPos: PlatformDragging = {
        id: this.id,
        x: this.sprite.x + Platform.defaultXOffset,
        y: this.sprite.y + Platform.defaultYOffset,
      };

      io.emit(userInputEvents.dragging, dragNewPos);
    });

    this.sprite.on("dragend", () => {
      if (this.draggingOnServerSide) {
        return;
      }
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

  static animateAllPlatforms() {
    for (const platform of this.platforms) {
      platform.animatePlatform()
    }
  }
  animatePlatform() {
    if (!this.sprite.anims) {
      return;
    }
    this.sprite.anims.play("fireAnimation", true);
  }
}
