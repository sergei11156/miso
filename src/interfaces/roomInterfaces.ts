export enum roomFromServerEvents {
  update = "updateRoom",
  youConnectedTo = "youConnectedTo",
}
export enum roomFromClientEvents {
  join = "join",
}

export interface updateRoomData {
  key: string;
  players: number;
  isWaiting: boolean;
}

export interface joinRoom {
  key: string;
  name: string;
}
export interface youConnectedTo{
  key: string;
}