export enum roomFromServerEvents {
  update = "updateRoom",
  youConnectedTo = "youConnectedTo",
  roomNotExist = "roomNotExist"
}
export enum roomFromClientEvents {
  join = "join",
  joinAnyRoom = "joinAnyRoom"
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
  isGameStarted: boolean;
}