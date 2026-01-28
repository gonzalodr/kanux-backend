import { Server, Socket, Namespace } from "socket.io";
import { SOCKET_EVENTS } from "./socket.config";
import { MessagesService } from "../modules/messages/messages.service";
import { CreateMessageSchema } from "../modules/messages/dto/create-message.dto";
import { ZodError } from "zod";

const messagesService = new MessagesService();

/**
 * Events interfaces
 */
interface SendMessagePayload {
  conversationId: string;
  text: string;
}

interface UserTypingPayload {
  conversationId: string;
  userId: string;
}

interface MessageReadPayload {
  messageId?: string; // Optional - if not provided, marks all unread messages
  conversationId: string;
}

interface JoinConversationPayload {
  conversationId: string;
}

/**
 * Handler for socket connection
 */
export function handleConnection(io: Server | Namespace, socket: Socket) {
  const userId = socket.data.user?.id;
  console.log(`✅ Usuario conectado: ${userId} (Socket: ${socket.id})`);

  // Join conversation
  socket.on(
    SOCKET_EVENTS.JOIN_CONVERSATION,
    (payload: JoinConversationPayload) => {
      handleJoinConversation(socket, payload);
    },
  );

  // Leave conversation
  socket.on(
    SOCKET_EVENTS.LEAVE_CONVERSATION,
    (payload: JoinConversationPayload) => {
      handleLeaveConversation(socket, payload);
    },
  );

  // Send message
  socket.on(
    SOCKET_EVENTS.SEND_MESSAGE,
    async (payload: SendMessagePayload, callback) => {
      await handleSendMessage(io, socket, payload, callback);
    },
  );

  // User typing
  socket.on(SOCKET_EVENTS.USER_TYPING, (payload: UserTypingPayload) => {
    handleUserTyping(io, socket, payload);
  });

  // User stopped typing
  socket.on(SOCKET_EVENTS.USER_STOP_TYPING, (payload: UserTypingPayload) => {
    handleUserStopTyping(io, socket, payload);
  });

  // Message read
  socket.on(SOCKET_EVENTS.MESSAGE_READ, async (payload: MessageReadPayload) => {
    await handleMessageRead(io, socket, payload);
  });

  // Disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    handleDisconnect(socket);
  });
}

/**
 * Join a conversation (room)
 */
async function handleJoinConversation(
  socket: Socket,
  payload: JoinConversationPayload,
) {
  try {
    const { conversationId } = payload;
    const userId = socket.data.user?.id;

    if (!userId) {
      return socket.emit(SOCKET_EVENTS.ERROR, {
        message: "User not authenticated",
      });
    }

    // SECURITY: Validate user has permission to access this conversation
    try {
      await messagesService.validateConversationAccess(userId, conversationId);
    } catch (error: any) {
      return socket.emit(SOCKET_EVENTS.ERROR, {
        message: "Access denied to conversation",
        error: error.message,
      });
    }

    // Join the conversation room
    socket.join(`conversation:${conversationId}`);

    console.log(`User ${userId} joined conversation ${conversationId}`);

    // Confirm join
    socket.emit("joined_conversation", {
      conversationId,
      success: true,
    });
  } catch (error: any) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Error joining conversation",
      error: error.message,
    });
  }
}

/**
 * Exit a conversation (room)
 */
function handleLeaveConversation(
  socket: Socket,
  payload: JoinConversationPayload,
) {
  try {
    const { conversationId } = payload;
    const userId = socket.data.user?.id;

    socket.leave(`conversation:${conversationId}`);

    console.log(`User ${userId} left conversation ${conversationId}`);

    socket.emit("left_conversation", {
      conversationId,
      success: true,
    });
  } catch (error: any) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Error leaving conversation",
      error: error.message,
    });
  }
}

/**
 * Send message
 */
async function handleSendMessage(
  io: Server | Namespace,
  socket: Socket,
  payload: SendMessagePayload,
  callback?: (response: any) => void,
) {
  try {
    const userId = socket.data.user?.id;

    if (!userId) {
      const error = { success: false, message: "User not authenticated" };
      if (callback) callback(error);
      return socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, error);
    }

    // Validate payload
    const validatedPayload = CreateMessageSchema.parse({
      conversation_id: payload.conversationId,
      content: payload.text,
    });

    // Save message in DB using existing service
    const message = await messagesService.sendMessage(userId, validatedPayload);

    // Response to sender
    const response = {
      success: true,
      messageId: message.id,
      timestamp: message.created_at,
      status: "sent",
    };

    if (callback) {
      callback(response);
    }

    // Emit to all users in the conversation (including the sender)
    io.to(`conversation:${payload.conversationId}`).emit(
      SOCKET_EVENTS.MESSAGE_RECEIVED,
      {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        senderType: message.sender_type,
        content: message.content,
        createdAt: message.created_at,
      },
    );

    console.log(`Message sent in conversation ${payload.conversationId}`);
  } catch (error: any) {
    console.error("Error sending message:", error);

    let errorMessage = "Error sending message";
    let errorDetails = error.message;

    if (error instanceof ZodError) {
      errorMessage = "Validation error";
      errorDetails = error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
    }

    const errorResponse = {
      success: false,
      message: errorMessage,
      error: errorDetails,
    };

    if (callback) {
      callback(errorResponse);
    }

    socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, errorResponse);
  }
}

/**
 * Usuario typing
 */
function handleUserTyping(
  io: Server | Namespace,
  socket: Socket,
  payload: UserTypingPayload,
) {
  try {
    const { conversationId, userId } = payload;

    // Emit to all except the sender
    socket
      .to(`conversation:${conversationId}`)
      .emit(SOCKET_EVENTS.USER_IS_TYPING, {
        conversationId,
        userId,
      });
  } catch (error: any) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Error al notificar typing",
      error: error.message,
    });
  }
}

/**
 * User stopped typing
 */
function handleUserStopTyping(
  io: Server | Namespace,
  socket: Socket,
  payload: UserTypingPayload,
) {
  try {
    const { conversationId, userId } = payload;

    socket
      .to(`conversation:${conversationId}`)
      .emit(SOCKET_EVENTS.USER_STOP_TYPING, {
        conversationId,
        userId,
      });
  } catch (error: any) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Error notifying stop typing",
      error: error.message,
    });
  }
}

/**
 * Mark message as read
 */
async function handleMessageRead(
  io: Server | Namespace,
  socket: Socket,
  payload: MessageReadPayload,
) {
  try {
    const { messageId, conversationId } = payload;
    const userId = socket.data.user?.id;

    if (!userId) {
      return socket.emit(SOCKET_EVENTS.ERROR, {
        message: "User not authenticated",
      });
    }

    // Mark message(s) as read in database
    const messageIds = messageId ? [messageId] : undefined;
    const result = await messagesService.markMessagesAsRead(
      userId,
      conversationId,
      messageIds,
    );

    // Emit to all in the conversation
    io.to(`conversation:${conversationId}`).emit(
      SOCKET_EVENTS.MESSAGES_MARKED_AS_READ,
      {
        conversationId,
        messageIds: result.messages,
        markedCount: result.markedCount,
        readBy: userId,
        readAt: new Date(),
      },
    );

    console.log(
      `${result.markedCount} message(s) marked as read by ${userId} in conversation ${conversationId}`,
    );
  } catch (error: any) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Error marking message as read",
      error: error.message,
    });
  }
}

/**
 * Disconnection
 */
function handleDisconnect(socket: Socket) {
  const userId = socket.data.user?.id;
  console.log(`User disconnected: ${userId} (Socket: ${socket.id})`);
}
