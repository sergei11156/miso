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
export default class Room  {
  key: string;
  private connectionCount: number;
  isWaiting: boolean;

  constructor(
    // scene: Phaser.Scene,
    // x: number,
    // y: number,
    key: string,
    connectionCount: number,
    isWaiting: boolean,
    onClick: (key: string) => void
  ) {
    this.key = key;
    this.connectionCount = connectionCount;
    this.isWaiting = isWaiting;
  }

  // getNewText() {
  //   this.text = generateText(this.key, this.connectionCount, this.isWaiting);
  //   return this.text;
  // }

  newData(params: updateRoomData) {
    this.connectionCount = params.players;
    this.isWaiting = params.isWaiting;
    // return this.getNewText();
  }
}
