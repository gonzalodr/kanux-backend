import { Request, Response } from "express";
import { SkillsService } from "./skills.service";
import { CreateSkillSchema } from "./dto/create-skill.dto";
import { ZodError } from "zod";
import { serializeBigInt } from "../../lib/serialize";

const skillsService = new SkillsService();

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

      const payload = CreateSkillSchema.parse(req.body);

      const skill = await skillsService.addSkill(userId, payload);

      res.status(201).json(serializeBigInt(skill));
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          message: "Validation error",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      res.status(400).json({ message: error.message });
    }
  }

  async deleteSkill(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const skillId = BigInt(req.params.id);
      if (isNaN(Number(skillId))) {
        return res.status(400).json({
          message: "Skill id must be a valid number",
        });
      }

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
