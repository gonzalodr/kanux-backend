import { prisma } from "../../../lib/prisma";

export class ContactService{

    async initiatedContact(id_company:string,id_talent:string){
        try{
            //validate if exist talent
            const talent = await prisma.talent_profiles.findUnique({where: { id: id_talent }});
            if (!talent) throw new Error("The talent profile does not exist.");
            //validate if exist company
            const company = await prisma.company.findUnique({where:{id:id_company}});
            if (!company) throw new Error("The company profile does not exist.");
            //validate subcrition 
            const subscription = await prisma.company_subscriptions.findFirst({
                where: { 
                    company_id: id_company,
                    status: "active" 
                },
                include: {
                    company_plans: {
                        include: {
                            company_plan_features: true 
                        }
                    }
                }
            });

            // validate if company cant contact with talent
            const canContact = subscription?.company_plans?.company_plan_features?.some(f => f.can_contact_talent === true);
            if (!canContact) { throw new Error("Your current plan does not allow you to contact talent directly."); }

            //validate if exist conversation
            const existingConversation = await prisma.conversations.findFirst({
                where: {company_id: id_company,id_profile: id_talent}
            });

            if (existingConversation) {return existingConversation;}
            //create new chat
            const newContact = await prisma.conversations.create({
                data:{
                    company_id: id_company,
                    id_profile: id_talent, 
                }
            })
            
            return newContact;
        }catch(error:any){
            throw new Error(error.message || "Error processing the record.");
        }
    }

}