import express from "express";

const app = express();
const port = 8080; // default port to listen
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
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );