export enum dudeFromServerEvents {
  createDude = "createDude",
}

export interface createDude {
  x: number;
  y: number;
  id: number;
  cameraFollow?: boolean;
}
