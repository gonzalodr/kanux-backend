import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Middleware to validate JWT in WebSocket connections
 */
export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Add user information to the socket
    socket.data.user = decoded;

    next();
  } catch (error: any) {
    next(new Error("Authentication error: Invalid token"));
  }
}
