import "dotenv/config"; 
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

export interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
  /**
   * Additional fields to interoperate with other services that expect `id`/`role`.
   */
  id?: string;
  role?: string;
  sessionId?: string;
}

export class JwtUtil {
  private static blacklistedTokens: Set<string> = new Set();

  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): JwtPayload {
    try {
      if (this.blacklistedTokens.has(token)) {
        throw new Error("Token has been revoked");
      }
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error: any) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  static revokeToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload | null;
    } catch {
      return null;
    }
  }
}
