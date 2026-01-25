import { v4 as uuidv4 } from "uuid";
import { JwtUtil, JwtPayload } from "./jwt.util";

export interface Session {
  sessionId: string;
  token: string;
  payload: JwtPayload;
  createdAt: number;
  expiresAt: number;
  deviceId?: string;
}

export class SessionManager {
  private static sessions: Map<string, Session> = new Map();
  private static sessionsByUserId: Map<string, string[]> = new Map();
  private static cleanupInterval: NodeJS.Timeout | null = null;

  static {
    SessionManager.startCleanup();
  }

  static createSession(
    payload: JwtPayload,
    deviceId?: string,
  ): {
    sessionId: string;
    token: string;
  } {
    const sessionId = uuidv4();
    const token = JwtUtil.generateToken({
      ...payload,
      sessionId,
    });

    const now = Date.now();
    const expiresIn = 7 * 24 * 60 * 60 * 1000;

    const session: Session = {
      sessionId,
      token,
      payload: {
        ...payload,
        sessionId,
      },
      createdAt: now,
      expiresAt: now + expiresIn,
      deviceId,
    };

    this.sessions.set(sessionId, session);

    // Registrar sesión por usuario
    if (!this.sessionsByUserId.has(payload.userId)) {
      this.sessionsByUserId.set(payload.userId, []);
    }
    this.sessionsByUserId.get(payload.userId)!.push(sessionId);

    return {
      sessionId,
      token,
    };
  }

  static verifySession(token: string): { valid: boolean; session?: Session } {
    try {
      const payload = JwtUtil.verifyToken(token);

      if (!payload.sessionId) {
        return { valid: false };
      }

      const session = this.sessions.get(payload.sessionId);

      if (!session) {
        return { valid: false };
      }

      if (session.expiresAt < Date.now()) {
        this.sessions.delete(session.sessionId);
        return { valid: false };
      }

      return { valid: true, session };
    } catch {
      return { valid: false };
    }
  }

  static getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);

    if (!session || session.expiresAt < Date.now()) {
      if (session) {
        this.sessions.delete(sessionId);
      }
      return null;
    }

    return session;
  }

  static getUserSessions(userId: string): Session[] {
    const sessionIds = this.sessionsByUserId.get(userId) || [];
    const activeSessions: Session[] = [];

    sessionIds.forEach((sessionId) => {
      const session = this.sessions.get(sessionId);
      if (session && session.expiresAt > Date.now()) {
        activeSessions.push(session);
      }
    });

    return activeSessions;
  }

  static invalidateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    JwtUtil.revokeToken(session.token);
    this.sessions.delete(sessionId);

    // Remover de sessions por usuario
    const userSessions = this.sessionsByUserId.get(session.payload.userId);
    if (userSessions) {
      const index = userSessions.indexOf(sessionId);
      if (index > -1) {
        userSessions.splice(index, 1);
      }
    }

    return true;
  }

  static invalidateAllUserSessions(userId: string): boolean {
    const sessionIds = this.sessionsByUserId.get(userId) || [];
    let invalidated = 0;

    sessionIds.forEach((sessionId) => {
      const session = this.sessions.get(sessionId);
      if (session) {
        JwtUtil.revokeToken(session.token);
        this.sessions.delete(sessionId);
        invalidated++;
      }
    });

    this.sessionsByUserId.delete(userId);
    return invalidated > 0;
  }

  static findActiveSession(userId: string, deviceId?: string): Session | null {
    const userSessions = this.getUserSessions(userId);

    if (deviceId) {
      return userSessions.find((s) => s.deviceId === deviceId) || null;
    }

    return userSessions.length > 0 ? userSessions[0] : null;
  }

  private static cleanupExpiredSessions(): void {
    const now = Date.now();

    this.sessions.forEach((session, sessionId) => {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    });
  }

  private static startCleanup(): void {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredSessions();
      },
      5 * 60 * 1000,
    ); // Cada 5 minutos
  }

  static stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  static getStats(): {
    totalSessions: number;
    totalUsers: number;
  } {
    return {
      totalSessions: this.sessions.size,
      totalUsers: this.sessionsByUserId.size,
    };
  }
}
