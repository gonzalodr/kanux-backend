import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userInfo } from "node:os";
import { decode } from "node:punycode";

interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
  id:string;
  role?: string;
  sessionId?: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({ 
      message: "Invalid token",
      error: error.message 
    });
  }
}