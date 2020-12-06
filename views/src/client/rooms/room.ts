import { updateRoomData } from "../interfaces/roomInterfaces";

function generateText(
  key: string,
  connectionCount: number,
  isWaiting: boolean
) {
  let resString = `Комната ${key} игроков ${connectionCount}. | Статус: `;
  if (isWaiting) {
    resString += "ожидание игроков";
  } else {
    resString += "идёт игра невозможно подключиться";
  }
  return resString;
}
export default class Room extends Phaser.GameObjects.Text {
  private key: string;
  private connectionCount: number;
  private isWaiting: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key: string,
    connectionCount: number,
    isWaiting: boolean,
    onClick: (key: string) => void
  ) {
    super(scene, x, y, generateText(key, connectionCount, isWaiting), {
      backgroundColor: "#0000",
    });
    this.key = key;
    this.connectionCount = connectionCount;
    this.isWaiting = isWaiting;
    this.setPosition(x - this.width / 2, y);
    this.setInteractive();
    this.on("pointerdown", () => onClick(this.key));
  }

  getNewText() {
    this.text = generateText(this.key, this.connectionCount, this.isWaiting);
    return this.text;
  }

  newData(params: updateRoomData) {
    this.connectionCount = params.players;
    this.isWaiting = params.isWaiting;
    return this.getNewText();
  }
}
