const express = require("express");
const http = require("http");
const next = require("next");
const { Server } = require("socket.io");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server);
  io.on("connection", (socket) => {
    console.log("a user connected");
  });
  app.post("/relay/click", (req, res) => {
    io.emit("click", req.body);
    res.send("click: OK");
  });

  app.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
