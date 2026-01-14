import { Request, Response, NextFunction } from "express";

export function mockAuth(req: Request, res: Response, next: NextFunction) {
  req.user = {
    userId: "dd99b4a9-148c-48dc-8ecd-64eb94f811ee",
    email: "test@talent.com",
    userType: "talent",
  };
  next();
}
