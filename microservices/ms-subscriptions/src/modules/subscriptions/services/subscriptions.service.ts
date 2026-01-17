import { prisma } from "../../../lib/prisma";
import { CreateCompanySubscriptionDto } from "../dto/companySubscription.dto";
import { CreateTalentSubscriptionDto } from "../dto/talentSubscription.dto";
import { SubscriptionStatus } from "../enums/subscriptionStatus.enum";
import { CompanyActionType } from "../enums/actionType.enum";

export class SubscriptionServices {
    async subscribeCompany(id_company: string, plan_id: string, data: CreateCompanySubscriptionDto) {
        const validatePlan = await prisma.company_plans.findUnique({ where: { id: plan_id } });
        if (!validatePlan) throw new Error("The company plan does not exist");

        const validateCompany = await prisma.company.findUnique({ where: { id: id_company } });
        if (!validateCompany) throw new Error("The company does not exist");

        return await prisma.$transaction(async (tx) => {
            // create the subscription
            const subscription = await tx.company_subscriptions.create({
                data: {
                    company_id: id_company,
                    plan_id: plan_id,
                    status: data.status,
                    end_date: data.end_date,
                }
            });

            //create the plan usage
            await tx.company_plan_usage.create({
                data: {
                    company_id: id_company,
                    profile_views_used: 0,
                    challenges_created: 0,
                    period_end: data.end_date
                }
            });
            return subscription;
        });
    }

    async subscribeTalent(id_profile: string, plan_id: string, data: CreateTalentSubscriptionDto) {
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

    async validateActionOfCompany(id_company: string, actionType: string) {
        const [subscription, usage] = await Promise.all([
            prisma.company_subscriptions.findFirst({
                where: {
                    company_id: id_company,
                    status: SubscriptionStatus.ACTIVE
                },
                include: {
                    company_plans: {
                        include: {
                            company_plan_features: true
                        }
                    }
                }
            }),
            prisma.company_plan_usage.findFirst({
                where: { company_id: id_company }
            })
        ]);

        // validate exist subscription
        if (!subscription || !subscription.company_plans) {
            return { allowed: false, reason: 'NO_ACTIVE_SUBSCRIPTION' };
        }
        //validate if use register
        if (!usage) {
            return { allowed: false, reason: 'NO_USAGE_RECORD_FOUND' };
        }

        // extract features
        const features = subscription.company_plans.company_plan_features[0];

        if (!features) {
            return { allowed: false, reason: 'PLAN_FEATURES_NOT_CONFIGURED' };
        }
        // validate with type action
        const validations: Record<string, { allowed: boolean; reason?: string }> = {
            [CompanyActionType.VIEW_PROFILE]: {
                allowed: usage.profile_views_used !== null && features.max_profile_views_per_month!== null ? usage.profile_views_used < features.max_profile_views_per_month : false,
                reason: 'MAX_PROFILE_VIEWS_REACHED'
            },
            [CompanyActionType.CONTACT_TALENT]: {
                allowed: features.can_contact_talent ? features.can_contact_talent : false,
                reason: 'FEATURE_NOT_IN_PLAN'
            },
            [CompanyActionType.ADVANCED_FILTERS]: {
                allowed: features.can_use_advanced_filters!== null ? features.can_use_advanced_filters : false,
                reason: 'FEATURE_NOT_IN_PLAN'
            },
            [CompanyActionType.CREATE_CHALLENGE]: {
                allowed: features.can_create_custom_challenges!== null ? features.can_create_custom_challenges : false,
                reason: 'FEATURE_NOT_IN_PLAN'
            },
            [CompanyActionType.ACCESS_METRICS]: {
                allowed: features.can_access_metrics!== null ? features.can_access_metrics : false,
                reason: 'FEATURE_NOT_IN_PLAN'
            }
        };

        const result = validations[actionType];

        // validate en response
        if (!result) {
            return { allowed: false, reason: 'INVALID_ACTION_TYPE' };
        }
        return {
            allowed: result.allowed,
            reason: result.allowed ? `Allowed action: ${actionType} ` : result.reason,
        };
    }

    async incrementProfileViewUsage(id_company: string) {
        const currentUsage = await prisma.company_plan_usage.findFirst({
            where: {
                company_id: id_company,
                period_end: { gte: new Date() }
            }
        });

        if (!currentUsage) {
            throw new Error("No active usage record found for this company or period has expired.");
        }
        return await prisma.company_plan_usage.updateMany({
            where: { 
                company_id: id_company,
            },
            data: {
                profile_views_used: { increment: 1 }
            }
        });
    }

    async incrementChallengeUsage(id_company: string) {
        const currentUsage = await prisma.company_plan_usage.findFirst({
            where: {
                company_id: id_company,
                period_end: { gte: new Date() }
            }
        });

        if (!currentUsage) {
            throw new Error("Cannot increment usage: Company usage record not found or expired.");
        }
        return await prisma.company_plan_usage.updateMany({
            where: { 
                company_id: id_company,
            },
            data: {
                challenges_created: { increment: 1 }
            }
        });
    }
}