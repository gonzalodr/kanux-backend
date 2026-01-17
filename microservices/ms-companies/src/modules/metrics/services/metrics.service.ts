import { prisma } from "../../../lib/prisma";

export class MetricsServices{
    async getMetricsCompany(id_company:string){
        try{
            const company= await prisma.company.findFirst({
                where:{
                    id:id_company
                },
                include:{
                    conversations: true,
                    challenges:{
                        include:{
                            challenge_submissions:true
                        }
                    },
                }
            });
            if (!company){ throw new Error("The company does not exist."); }
            //get challenges actives
            const active_challenges = company.challenges.length; 
            // get candidate in all challenges
            const candidates_evaluated =  company.challenges.reduce((acc, ch) => acc + ch.challenge_submissions.length, 0)  
            // get all conversatios
            const total_conversation = company.conversations.length;

            return {active_challenges, candidates_evaluated, total_conversation}

        }catch(error){
            throw new Error("")
        }
    }
}