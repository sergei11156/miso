import express from "express";
import GameServer from "./GameServer";
import http from "http";
import https from "https";
import fs from "fs";

let httpsOptions = {
    key: fs.readFileSync("/usr/src/app/dist/key.key"), // путь к ключу
    cert: fs.readFileSync("/usr/src/app/dist/sergei11156_ru.crt") // путь к сертификату
}

const app = express();
const views = "/usr/src/app/views/dist/";
const assets = "/usr/src/app/views/assets/";

app.get( "/", ( req, res ) => {
    res.sendFile(views + 'index.html');
} );

app.get( "/bundle.js", ( req, res ) => {
    res.sendFile(views + 'bundle.js');
} );

app.use('/assets', express.static(assets));

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

const httpsServer = https.createServer(httpsOptions, app).listen(443);

const io: SocketIO.Server = require("socket.io")(httpsServer)
const gameServer = new GameServer(io);
