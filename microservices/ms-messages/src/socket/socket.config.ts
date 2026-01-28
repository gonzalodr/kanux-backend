import { Server } from "socket.io";
import http from "http";

/**
 * Centralized WebSocket configuration
 */
export function initializeSocketIO(httpServer: http.Server): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    transports: ["websocket", "polling"],
  });

  console.log("Socket.IO initialized");

  return io;
}

/**
 * Socket.IO Namespaces
 */
export const SOCKET_NAMESPACES = {
  MESSAGES: "/messages",
} as const;

/**
 * Socket.IO Events
 */
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  DISCONNECTING: "disconnecting",

  // Rooms
  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",

  // Messages
  SEND_MESSAGE: "send_message",
  MESSAGE_RECEIVED: "message_received",
  MESSAGE_ERROR: "message_error",

  // Typing
  USER_TYPING: "user_typing",
  USER_IS_TYPING: "user_is_typing",
  USER_STOP_TYPING: "user_stop_typing",

  // Read status
  MESSAGE_READ: "message_read",
  MESSAGES_MARKED_AS_READ: "messages_marked_as_read",

  // Errors
  ERROR: "error",
} as const;
