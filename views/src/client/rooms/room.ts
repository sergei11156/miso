import { updateRoomData } from "../interfaces/roomInterfaces";

export default class Room extends Phaser.GameObjects.Text {
  private key: string;
  private connectionCount: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key: string,
    connectionCount: number,
    onClick: (key: string) => void
  ) {
    super(scene, x, y, `Комната ${key} игроков ${connectionCount}`, {
      backgroundColor: "#0000"
    });
    this.key = key;
    this.connectionCount = connectionCount;
    this.setPosition(x - this.width/2, y);
    this.setInteractive();
    this.on("pointerdown", () => onClick(this.key))
  }

  getNewText() {
    const connectionCount = this.connectionCount;
    const key = this.key;
    const text = `Комната ${key} игроков ${connectionCount}`;
    this.text = text;
    return text;
  }

  newData(params: updateRoomData) {
    this.connectionCount = params.players;
    return this.getNewText();
  }
}
