import { Request, Response } from "express";
import { ProfilesService } from "./profiles.service";
import { UpdateTalentProfileSchema } from "./dto/update-talent-profile.dto";
import { ZodError } from "zod";

const profilesService = new ProfilesService();

export class ProfilesController {
  async updateMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const payload = UpdateTalentProfileSchema.parse(req.body);

      const updated = await profilesService.updateMyProfile(userId, payload);

      res.json(updated);
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

      res.status(400).json({
        message: error.message || "Unexpected error",
      });
    }
  }
}
