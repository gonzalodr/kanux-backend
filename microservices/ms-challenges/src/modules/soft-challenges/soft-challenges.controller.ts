import { Request, Response } from "express";
import { SoftChallengesService } from "./soft-challenges.service";
import { serializeBigInt } from "../../lib/serialize";

const softChallengesService = new SoftChallengesService();

export class SoftChallengesController {
  async listChallenges(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await softChallengesService.findAll(page, limit);
      res.json(serializeBigInt(result));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const challenge = await softChallengesService.findById(id);
      res.json(serializeBigInt(challenge));
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
