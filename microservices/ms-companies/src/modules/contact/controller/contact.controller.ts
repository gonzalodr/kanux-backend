import { Request, response, Response } from "express";
import { ContactService } from "../services/contact.service";
import z from "zod";


export class ContactController{
    private contactService:ContactService;

    constructor(){
        this.contactService = new ContactService();
    }

    async contactWithTalent(req:Request, res:Response){
        try{
            const {id_company,id_talent} = req.params;

            if (!id_talent || !z.uuid().safeParse(id_talent).success) {
                return res.status(400).json({ message: "A valid UUID for Company ID is required" });
            }
            if (!id_talent || !z.uuid().safeParse(id_talent).success) {
                return res.status(400).json({ message: "A valid UUID for Talent ID is required" });
            }
            const result = this.contactService.initiatedContact(id_company,id_talent);


            return res.status(200).json({data:result, status:"CHAT_INITIALIZED"});
        }catch(error:any){
            if (error.name === "ZodError") {
                return res.status(422).json({ errors: error.errors });
            }

            res.status(400).json({message: error.message || "Internal server error"});
        }
    }


}