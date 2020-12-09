export enum gameSceneFromClient {
  sceneReady = "sceneReady",
  imNotReady = "imNotReady",
  pointerPosition = "pointerPosition"
}
export enum gameSceneFromServer {
  gameStartTimerOn = "gameStartTimerOn",
  gameStartTimerOff = "gameStartTimerOn",
  gameStartTimerUpdate = "gameStartTimerUpdate",
  userList = "userList",
  youDieWithScore = "youDieWithScore",
  victory = "victory",
  userListWithPoints = "userListWithPoint",
  updatePointer = "updatePointer",
  createPointer = "createPointer",
  removePointer = "removePointer"
}

export interface youDieWithScore {
  score: number;
}

export interface userList {
  users: Array<{ id: number; name: string; points?: number; statusReady: "ready" | "notready" | "play" }>;
  canStartNewGame?: boolean;
}

export interface pointerPosition {
  x:number;
  y: number;  
}
export interface updatePointerPosition {
  id:number;
  x:number;
  y: number;
}