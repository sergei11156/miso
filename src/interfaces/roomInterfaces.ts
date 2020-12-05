export enum roomFromServerEvents {
  update = "update",
  youConnectedTo = "youConnectedTo",
}
export enum roomFromClientEvents {
  join = "join",
}

export interface updateRoomData {
  key: string;
  players: number;
}

export interface joinRoom {
  key: string;
}
