
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
  dragEnd = "dragEnd"
}