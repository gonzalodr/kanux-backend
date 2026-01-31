import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id?: string;
  userId?: string;
  email: string;
  role?: string;
  userType?: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const id = decoded.id ?? decoded.userId;
    const role = decoded.role ?? decoded.userType;

    if (!id || !role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { id, email: decoded.email, role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
