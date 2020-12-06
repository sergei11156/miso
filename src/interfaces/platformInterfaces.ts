export enum platformEventsFromServer {
  createPlatform = "createPlatform",
}

export interface platformCreate {
  id: number;
  x: number;
  y: number;
}
