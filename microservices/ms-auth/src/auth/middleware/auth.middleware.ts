import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../../utils/security/jwt.util";
import { SessionManager } from "../../utils/security/session.manager";
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        userType: string;
        sessionId?: string;
      };
      token?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No authorization header provided",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const payload = JwtUtil.verifyToken(token);

    if (payload.sessionId) {
      const sessionVerification = SessionManager.verifySession(token);

      if (!sessionVerification.valid) {
        return res.status(401).json({
          error: "Session has expired or is invalid",
        });
      }
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      userType: payload.userType,
      sessionId: payload.sessionId,
    };
    req.token = token;

    next();
  } catch (error: any) {
    return res.status(401).json({
      error: "Invalid token",
      message: error.message,
    });
  }
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const payload = JwtUtil.verifyToken(token);

    if (payload.sessionId) {
      const sessionVerification = SessionManager.verifySession(token);

      if (sessionVerification.valid) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          userType: payload.userType,
          sessionId: payload.sessionId,
        };
        req.token = token;
      }
    }

    next();
  } catch {
    next();
  }
};
