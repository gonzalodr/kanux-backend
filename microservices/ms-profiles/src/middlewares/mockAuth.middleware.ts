import { Request, Response, NextFunction } from "express";

export function mockAuth(req: Request, res: Response, next: NextFunction) {
  req.user = {
    id: "dd99b4a9-148c-48dc-8ecd-64eb94f811ee",
    email: "test@talent.com",
    role: "talent",
    userId: "dd99b4a9-148c-48dc-8ecd-64eb94f811ee",
    userType: "talent",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  next();
}
