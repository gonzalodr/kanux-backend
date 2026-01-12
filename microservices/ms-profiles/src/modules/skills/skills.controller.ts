import { Request, Response } from "express";
import { SkillsService } from "./skills.service";
import { CreateSkillDto } from "./dto/create-skill.dto";

const skillsService = new SkillsService();

function serializeBigInt(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export class SkillsController {
  async getMySkills(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const skills = await skillsService.getMySkills(userId);

      res.json(serializeBigInt(skills));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async addSkill(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const payload: CreateSkillDto = req.body;

      const skill = await skillsService.addSkill(userId, payload);

      res.status(201).json(serializeBigInt(skill));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteSkill(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const skillId = BigInt(req.params.id);

      await skillsService.deleteSkill(userId, skillId);

      res.json({
        success: true,
        message: "Skill deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
