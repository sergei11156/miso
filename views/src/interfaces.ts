
export interface PlatformDragStartOrEnd {
  id: number
}

export interface PlatformDragging {
  id: number,
  x: number,
  y: number
}

export enum userInputEvents {
  dragStart = "dragStart",
  dragging = "dragging",
  dragEnd = "dragEnd",
  gameRestart = "gameRestart",
  create = "create",
  update = "update",
  restartGame = "restartGame",
  youDie = "youDie",
  die = "die"
}
export interface youDie {
  id: number,
  newFollowId: number
}
export interface die {
  id: number
}
export interface gameCreateObject {
  key: string,
  id: number,
  x: number,
  y: number,
  cameraFollow?: boolean
}

export interface gameUpdateObject {
  id: number,
  x: number,
  y: number
}