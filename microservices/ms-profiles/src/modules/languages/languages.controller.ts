import { Request, Response } from "express";
import { LanguagesService } from "./languages.service";
import { CreateLanguageSchema } from "./dto/create-language.dto";
import { ZodError } from "zod";
import { serializeBigInt } from "../../lib/serialize";

const languagesService = new LanguagesService();

export class LanguagesController {
  async getMyLanguages(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const languages = await languagesService.getMyLanguages(userId);

      res.json(serializeBigInt(languages));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async addLanguage(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const payload = CreateLanguageSchema.parse(req.body);

      const language = await languagesService.addLanguage(userId, payload);

      res.status(201).json(serializeBigInt(language));
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

  async deleteLanguage(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const id = req.params.id;

      await languagesService.deleteLanguage(userId, id);

      res.json({
        success: true,
        message: "Language deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateLanguage(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const payload = CreateLanguageSchema.partial().parse(req.body);

      const updatedLanguage = await languagesService.updateLanguage(userId, id, payload);

      res.json(serializeBigInt(updatedLanguage));
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
        message: error.message || "Unexpected error" 
      });
    }
  }
}
