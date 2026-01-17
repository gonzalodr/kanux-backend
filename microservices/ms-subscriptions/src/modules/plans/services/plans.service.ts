import { prisma } from "../../../lib/prisma";
import { CreateTalentPlanDto } from "../dto/talent_plan.dto";
import { CreateCompanyPlanDto } from "../dto/company_plan.dto";

export class PlanServices {
  async getAllPlanCompany() {

    try {
      const plans = await prisma.company_plans.findMany({
        include: {
          company_plan_features: true,
        },
      });

      return plans;
    } catch (error: any) {
      throw new Error("Failed to retrieve company plans from the database.");
    }
  }

  async getAllPlanTalent() {
    try {
      const plans = await prisma.talent_plans.findMany({
        include: {
          talent_plan_features: true,
        },
      });

      return plans;
    } catch (error: any) {
      throw new Error("Failed to retrieve talent plans from the database.");
    }
  }

  async createPlanTalent(data: CreateTalentPlanDto) {
    try {
      const plansResult = await prisma.talent_plans.create({
        data: {
          name: data.name,
          description: data.description,
          price_monthly: data.price_monthly,
          talent_plan_features: {
            create: {
              can_access_basic_challenges: data.features.can_access_basic_challenges,
              can_access_advanced_challenges: data.features.can_access_advanced_challenges,
              can_access_detailed_reports: data.features.can_access_detailed_reports,
            }
          }
        },
        include: {
          talent_plan_features: true
        }
      })
      return data
    } catch (error: any) {
      throw new Error("Could not create the talent plan and its features.");
    }
  }

  async createPlanCompany(data: CreateCompanyPlanDto) {
    try {
      const planResult = await prisma.company_plans.create({
        data: {
          name: data.name,
          description: data.description,
          price_monthly: data.price_monthly,
          company_plan_features: {
            create: {
              max_profile_views_per_month: data.features.max_profile_views_per_month,
              can_contact_talent: data.features.can_contact_talent,
              can_use_advanced_filters: data.features.can_use_advanced_filters,
              can_create_custom_challenges: data.features.can_create_custom_challenges,
              can_access_metrics: data.features.can_access_metrics,
              can_access_reports: data.features.can_access_reports,
            }
          }
        },
        include: {
          company_plan_features: true
        }
      });

      return planResult;
    } catch (error: any) {
      throw new Error("The company plan could not be created. Please check the provided data.");
    }
  }
}
