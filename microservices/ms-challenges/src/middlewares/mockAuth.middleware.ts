import { Request, Response, NextFunction } from "express";

export function mockAuth(req: Request, res: Response, next: NextFunction) {
  req.user = {
    id: "dd99b4a9-148c-48dc-8ecd-64eb94f811ee",
    email: "test@talent.com",
    role: "talent",
  };
  next();
}

export function mockAuthCompany(req: Request, res: Response, next: NextFunction) {
  req.user = {
    id: "dd99b4a9-148c-48dc-8ecd-64eb94f811ee",
    email: "test@comany.com",
    role: "company",
  };
  next();
}

