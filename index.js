require("dotenv").config();
const cors = require("cors");
const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");

const app = express();
const server = http.createServer(app);
const {setupSocket} = require("./sockets/socketHandler");

const routerPath = require("./routes/router");

console.log(fs.existsSync(__dirname + "/image/Pack1-Header.png"));
app.use("/image", express.static(__dirname + "/image"));

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api", routerPath);

setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server listen to http://localhost:${PORT}`);
});
