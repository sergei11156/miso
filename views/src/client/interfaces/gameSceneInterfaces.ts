export enum gameSceneFromClient {
  sceneReady = "sceneReady",
  imNotReady = "imNotReady",
}
export enum gameSceneFromServer {
  gameStartTimerOn = "gameStartTimerOn",
  gameStartTimerOff = "gameStartTimerOn",
  gameStartTimerUpdate = "gameStartTimerUpdate",
  userList = "userList",
  youDieWithScore = "youDieWithScore",
  victory = "victory",
  userListWithPoints = "userListWithPoint"
}

export interface youDieWithScore {
  score: number;
}

export interface userList {
  users: Array<{ id: number; name: string; points?: number; statusReady?: boolean }>;
  canStartNewGame?: boolean;
}

