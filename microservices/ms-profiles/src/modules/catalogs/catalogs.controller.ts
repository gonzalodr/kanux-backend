import { Request, Response } from "express";
import { CatalogsService } from "./catalogs.service";

const catalogsService = new CatalogsService();

export class CatalogsController {
  async getCatalogs(req: Request, res: Response) {
    const data = await catalogsService.getAll();
    res.json(data);
  }
}
