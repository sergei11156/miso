export enum platformEventsFromServer {
  createPlatform = "createPlatform",
  destroyPlatform = "destroyPlatform"
}
export enum platformEventsFromClient {
  platformDragToCloseZone= "platformDragToSafeZone",
}
export interface platformDragToCloseZone {
  id: number;
}
export interface platformCreate {
  id: number;
  x: number;
  y: number;
}
