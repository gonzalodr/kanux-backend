import { Request, Response } from "express";
import { ProfilesService } from "./profiles.service";
import { UpdateTalentProfileSchema } from "./dto/update-talent-profile.dto";
import { CreateTalentProfileSchema } from "./dto/create-talent-profile.dto";
import { serializeBigInt } from "../../lib/serialize";
import { ZodError } from "zod";

const profilesService = new ProfilesService();

export class ProfilesController {
  async getMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await profilesService.getMyProfile(userId);
      res.json(serializeBigInt(profile));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPublicTalentProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await profilesService.getPublicTalentProfile(id);
      res.json(serializeBigInt(profile));
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const file = req.file;
      const bodyData = { ...req.body }
      if (typeof bodyData.contact === 'string') {
        try {
          bodyData.contact = JSON.parse(bodyData.contact);
        } catch (e) {
          return res.status(400).json({ message: "Invalid format for contact field" });
        }
      }

      const payload = UpdateTalentProfileSchema.parse(req.body);

      const updated = await profilesService.updateMyProfile(userId, payload, file);

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

  async preregisterTalentProfiles(req: Request, res: Response) {
    try {

      const { id_user } = req.params;
      const parseTalenT = CreateTalentProfileSchema.parse(req.body);

      const result = await profilesService.preregisterProfile(id_user, parseTalenT);

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Unexpected error" });
    }
  }
}
