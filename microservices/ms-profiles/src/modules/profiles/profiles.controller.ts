import { Request, Response } from "express";
import { ProfilesService } from "./profiles.service";
import { UpdateTalentProfileDto } from "./dto/update-talent-profile.dto";

const profilesService = new ProfilesService();

export class ProfilesController {
  async updateMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const payload: UpdateTalentProfileDto = req.body;

      const updated = await profilesService.updateMyProfile(userId, payload);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
