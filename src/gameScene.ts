import { userInputEvents } from "./interfaces/interfaces";
import DudeServer from "./dudeServer";
import GameObject from "./gameObject";
import PlatformServer from "./PlatformServer";
import UserInputServer from "./userInputServer";
import GameServer from "./GameServer";

export class GameScene extends Phaser.Scene {
  io: SocketIO.Server;
  startPlayerYPosition = 200;
  static lastObjectId: number = 0;
  playerId: number;

  worldWidth = 4000;
  private gameStarted = false;
  private key: string;

  init(params: { io: SocketIO.Server; key: string }) {
    this.io = params.io;
    this.key = params.key;
  }

  create() {
    const platforms = this.physics.add.group();
    const dudesGroup = this.physics.add.group();

    this.physics.add.collider(
      dudesGroup,
      platforms,
      (object1: GameObject, object2: GameObject) => {
        let dude, platform;
        console.log(object1.key);

        if (object1.key == "dude") {
          dude = object1 as DudeServer;
          platform = object2 as PlatformServer;
        } else {
          dude = object2 as DudeServer;
          platform = object1 as PlatformServer;
        }

        dude.youDied();
      }
    );

    DudeServer.init(this.io, dudesGroup, this.worldWidth / 2);
    PlatformServer.init(this.io, platforms);

    const connected = this.io.in(this.key).connected;
    for (const key in connected) {
      if (Object.prototype.hasOwnProperty.call(connected, key)) {
        const socket = connected[key];
        console.log("new connection");

        let uis = new UserInputServer(socket, this);

        let dude: DudeServer;

        socket.on("init", () => {
          dude = DudeServer.add(socket);
        });

        socket.on("disconnect", (reason) => {
          if (dude) {
            let removeId = dude.id;
            DudeServer.dudes.remove(dude, true, true);
            socket.broadcast.emit(userInputEvents.remove, { id: removeId });
          }
          if (uis) {
            uis.remove();
          }
        });
      }
    }
  }

  update(time: number, delta: number): void {
    if (this.gameStarted) {
      DudeServer.update(delta);
    }
  }

  restartGame() {
    this.physics.resume();
    this.io.emit(userInputEvents.restartGame);
    PlatformServer.clear();
    this.gameStarted = true;
    PlatformServer.gameStarted = true;
    DudeServer.startGame();
  }

  gameStop() {
    this.gameStarted = false;
    PlatformServer.clear();
    PlatformServer.gameStarted = false;
    UserInputServer.setAllToNotReady();
    DudeServer.gameEnd();
  }
}
