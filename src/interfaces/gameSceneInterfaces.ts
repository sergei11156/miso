export enum gameSceneFromClient {
  sceneReady = "sceneReady",
  imNotReady = "imNotReady",
}
export enum gameSceneFromServer {
  gameStartTimerOn = "gameStartTimerOn",
  gameStartTimerOff = "gameStartTimerOn",
  gameStartTimerUpdate = "gameStartTimerUpdate",
  userList = "userList",
}

export interface userList {
  users: Array<{ id: number; name: string; points?: string; statusReady?: boolean }>;
}
