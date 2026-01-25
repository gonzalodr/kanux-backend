import { Request, Response } from "express";
import { z } from "zod";
import { FeedbackService } from "./feedback.service";

const service = new FeedbackService();

export class FeedbackController {
  async generate(req: Request, res: Response) {
    try {
      const parsed = z
        .object({ submissionId: z.string().uuid() })
        .safeParse({ submissionId: req.params.submissionId });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid submission id" });
      }
      const data = await service.generateAndStore(parsed.data.submissionId);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, message: err?.message || "Unexpected error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const parsed = z
        .object({ submissionId: z.string().uuid() })
        .safeParse({ submissionId: req.params.submissionId });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid submission id" });
      }
      const data = await service.list(parsed.data.submissionId);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, message: err?.message || "Unexpected error" });
    }
  }
}
