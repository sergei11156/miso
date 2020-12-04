import express from "express";
import GameServer from "./GameServer";

const app = express();

const port = 80; // default port to listen
const views = "/usr/src/app/views/dist/";
const assets = "/usr/src/app/views/assets/";

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.sendFile(views + 'index.html');
} );

app.get( "/bundle.js", ( req, res ) => {
    res.sendFile(views + 'bundle.js');
} );

app.use('/assets', express.static(assets));

// start the Express server
const server = app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );

const io: SocketIO.Server = require("socket.io")(server)
const gameServer = new GameServer(io);


// io.on("connection", function (socket: SocketIO.Socket) {
//     console.log("new connecton");
    
// })