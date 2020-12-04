import { PlatformDragging, PlatformDragStartOrEnd, userInputEvents } from "../interfaces";
import PlatformServer from "./PlatformServer";

export default class UserInputServer {
  constructor(socket: SocketIO.Socket) {
    socket.on(userInputEvents.dragStart, (params: PlatformDragStartOrEnd) => {
      PlatformServer.dragStart(params, socket);
    });
    socket.on(userInputEvents.dragEnd, (params: PlatformDragStartOrEnd) => {
      PlatformServer.dragEnd(params, socket);
    });
    socket.on(userInputEvents.dragging, (params: PlatformDragging) => {
      PlatformServer.dragging(params, socket);
    });
  }
}
