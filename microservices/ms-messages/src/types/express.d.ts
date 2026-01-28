import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        company_id?: string;
        talent_id?: string;
      };
    }
  }
}

declare module "socket.io" {
  interface Socket {
    data: {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    };
  }
}
