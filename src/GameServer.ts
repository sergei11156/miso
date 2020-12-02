
export default class GameServer {
  private io: SocketIO.Server

  constructor(io: SocketIO.Server) {
    this.io = io;
    
  }
} 