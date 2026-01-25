import { UserType } from "../../constants/userType";
import { PasswordUtil } from "../../utils/security/password.util";
import { UserRepository } from "../../repository/user.repository";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import { JwtUtil } from "../../utils/security/jwt.util";
import { SessionManager } from "../../utils/security/session.manager";
import { talent_profiles, company } from "@prisma/client";

interface LoginDTO {
  email: string;
  password: string;
  deviceId?: string;
}

export class AuthService {
  static async preRegister(data: {
    email: string;
    password: string;
    userType: string;
    deviceId?: string;
  }) {
    const { email, password, userType, deviceId } = data;

    if (!Object.values(UserType).includes(userType as UserType)) {
      throw new Error("INVALID_USER_TYPE");
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    return prisma.$transaction(async (tx) => {
      const password_hash = await PasswordUtil.hash(password);

      const user = await UserRepository.create({
        email,
        password_hash,
        user_type: userType,
      });

      if (userType === UserType.TALENT) {
        await tx.talent_profiles.create({
          data: { user_id: user.id },
        });
      } else {
        if (userType === UserType.COMPANY) {
          await tx.company.create({
            data: { id_user: user.id },
          });
        }
      }

      // Crear sesión automáticamente después del registro
      const session = SessionManager.createSession(
        {
          userId: user.id,
          email: user.email,
          userType: user.user_type,
        },
        deviceId
      );

      return {
        success: true,
        user: user.id,
        token: session.token,
        sessionId: session.sessionId,
        nextStep:
          userType === UserType.TALENT ? "REGISTER_TALENT" : "REGISTER_COMPANY",
      };
    });
  }

  static async login({
    email,
    password,
    deviceId,
  }: LoginDTO & { deviceId?: string }) {
    const user = await UserRepository.findAuthUserByEmail(email);

    console.log("User found during login:");
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const existingSession = SessionManager.findActiveSession(user.id, deviceId);

    let token: string;
    let sessionId: string;

    if (existingSession) {
      token = existingSession.token;
      sessionId = existingSession.sessionId;
    } else {
      const session = SessionManager.createSession(
        {
          userId: user.id,
          email: user.email,
          userType: user.user_type,
        },
        deviceId,
      );
      token = session.token;
      sessionId = session.sessionId;
    }

    const profile =
      user.user_type === "company" ? user.company : user.talent_profiles;

    return {
      token,
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        profile: profile,
      },
    };
  }

  static logout(sessionId: string): boolean {
    return SessionManager.invalidateSession(sessionId);
  }

  static logoutAllDevices(userId: string): boolean {
    return SessionManager.invalidateAllUserSessions(userId);
  }

  static verifySession(token: string): {
    valid: boolean;
    sessionId?: string;
    userId?: string;
  } {
    const verification = SessionManager.verifySession(token);

    if (!verification.valid || !verification.session) {
      return { valid: false };
    }

    return {
      valid: true,
      sessionId: verification.session.sessionId,
      userId: verification.session.payload.userId,
    };
  }

  static getUserActiveSessions(userId: string) {
    const sessions = SessionManager.getUserSessions(userId);
    return sessions.map((s) => ({
      sessionId: s.sessionId,
      deviceId: s.deviceId,
      createdAt: new Date(s.createdAt),
      expiresAt: new Date(s.expiresAt),
    }));
  }
}
