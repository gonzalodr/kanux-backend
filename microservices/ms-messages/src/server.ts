import app from "./app";
import dotenv from "dotenv";
import http from "http";
import { initializeSocketIO, SOCKET_NAMESPACES } from "./socket/socket.config";
import { socketAuthMiddleware } from "./socket/socket.middleware";
import { handleConnection } from "./socket/socket.handlers";

dotenv.config();

const requiredEnv = ["PORT", "DATABASE_URL", "JWT_SECRET"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

dotenv.config();

const PORT = process.env.MS_CHAT_PORT || 3006;

const httpServer = http.createServer(app);
const io = initializeSocketIO(httpServer);
const messagesNamespace = io.of(SOCKET_NAMESPACES.MESSAGES);

messagesNamespace.use(socketAuthMiddleware);

messagesNamespace.on("connection", (socket) => {
  handleConnection(messagesNamespace, socket);
});

httpServer.listen(PORT, () => {
  console.log("ms-chat running on port " + PORT);
  console.log(
    `WebSocket ready at ws://localhost:${PORT}${SOCKET_NAMESPACES.MESSAGES}`,
  );
});
