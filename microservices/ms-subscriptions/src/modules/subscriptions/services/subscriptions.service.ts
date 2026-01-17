import { prisma } from "../../../lib/prisma";
import { CreateCompanySubscriptionDto } from "../dto/companySubscription.dto";
import { CreateTalentSubscriptionDto } from "../dto/talentSubscription.dto";

export class SubscriptionServices {
    async subscribeCompany(id_company: string, plan_id: string, data: CreateCompanySubscriptionDto) {
        const validatePlan = await prisma.company_plans.findUnique({ where: { id: plan_id } });
        if (!validatePlan) throw new Error("The company plan does not exist");

        const validateCompany = await prisma.company.findUnique({ where: { id: id_company } });
        if (!validateCompany) throw new Error("The company does not exist");

        return await prisma.company_subscriptions.create({
            data: {
                company_id: id_company,
                plan_id: plan_id,
                status: data.status,
                start_date: data.start_date,
                end_date: data.end_date,
            }
        });
    }
    async subscribeTalent(id_profile: string, plan_id: string, data:CreateTalentSubscriptionDto){
        const validatePlan = await prisma.talent_plans.findUnique({ where: { id: plan_id } });
        if (!validatePlan) throw new Error("The talent plan does not exist");

        const validateProfile = await prisma.talent_profiles.findUnique({ where: { id: id_profile } });
        if (!validateProfile) throw new Error("The talent profile does not exist");

        return await prisma.talent_subscriptions.create({
            data: {
                id_profile: id_profile,
                plan_id: plan_id,
                status: data.status,
                start_date: data.start_date,
                end_date: data.end_date,
            }
        });
    }
}