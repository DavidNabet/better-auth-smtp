import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import socketHandler from "./socket";

const port = parseInt(process.env.PORT || "3005", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";

const app = next({ dev, hostname, port, turbopack: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parseUrl = parse(req.url!, true);
    handler(req, res, parseUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socketHandler(socket, io);
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`👍 Ready on http://${hostname}:${port}`);
    });
});
