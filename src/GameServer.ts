import jsdom from "jsdom";
const { JSDOM } = jsdom;
import path from "path";
import datauriParser from "datauri/parser";
const datauri = new datauriParser();
// const datauri= new datauriParser();

export default class GameServer {
  private io: SocketIO.Server;

  constructor(io: SocketIO.Server) {
    this.io = io;
    this.setupAuthoritativeServer();
  }

  private setupAuthoritativeServer() {
    JSDOM.fromFile("/usr/src/app/views/dist/room.html", {
      // To run the scripts in the html file
      runScripts: "dangerously",
      // Also load supported external resources
      resources: "usable",
      // So requestAnimatinFrame events fire
      pretendToBeVisual: true,
    })
      .then((dom) => {
        dom.window.URL.createObjectURL = (blob) => {
          if (blob) {
            // datauri()
            return datauri.format(
              blob.type,
              blob[Object.getOwnPropertySymbols(blob)[0]]._buffer
            ).content;
          }
        };
        dom.window.URL.revokeObjectURL = (objectURL) => {};

        dom.window.io = this.io;
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
}
