import { Request, Response, NextFunction } from "express";

export function mockAuth(req: Request, res: Response, next: NextFunction) {
  req.user = {
    id: "c11afcd5-b66d-4fb4-b876-99a3b30b32c1",
    email: "test@company.com",
    role: "company",
    company_id: "d7c93e52-0434-4e9a-9573-2c67ca75126b",
  };
  next();
}
