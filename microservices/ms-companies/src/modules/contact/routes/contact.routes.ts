import { Router } from "express";
import { ContactController } from "../controller/contact.controller";

const router = Router();
const contactCotroller = new ContactController();

router.post("/:id_company,:id_talent",contactCotroller.contactWithTalent.bind(contactCotroller));

export default router;