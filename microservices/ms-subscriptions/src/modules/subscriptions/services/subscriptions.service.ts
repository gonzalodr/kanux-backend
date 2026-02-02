import { prisma } from "../../../lib/prisma";
import { CreateCompanySubscriptionDto } from "../dto/companySubscription.dto";
import { CreateTalentSubscriptionDto } from "../dto/talentSubscription.dto";
import { SubscriptionStatus } from "../enums/subscriptionStatus.enum";
import { CompanyActionType } from "../enums/actionType.enum";

export class SubscriptionServices {

    private getSubscriptionDates() {
        const start = new Date();
        const end = new Date();
        end.setMonth(start.getMonth() + 1);
        return { start, end };
    }

    async subscribeCompany(id_user: string, plan_id: string, data: CreateCompanySubscriptionDto) {
        const validatePlan = await prisma.company_plans.findUnique({ where: { id: plan_id } });
        if (!validatePlan) throw new Error("The company plan does not exist");

        const validateCompany = await prisma.company.findUnique({ where: { id_user: id_user } });
        if (!validateCompany) throw new Error("The company does not exist");

        const { start, end } = this.getSubscriptionDates();

        return await prisma.$transaction(async (tx) => {
            await tx.company_subscriptions.updateMany({
                where: { company_id: validateCompany.id, status: SubscriptionStatus.ACTIVE },
                data: { status: SubscriptionStatus.INACTIVE }
            });
            // create the subscription
            const subscription = await tx.company_subscriptions.create({
                data: {
                    company_id: validateCompany.id,
                    plan_id: plan_id,
                    status: data.status,
                    start_date: start,
                    end_date: end,
                }
            });

            //create the plan usage
            const existingUsage = await tx.company_plan_usage.findFirst({ where: { company_id: validateCompany.id } });
            //update plan usage for company
            if (existingUsage) {
                await tx.company_plan_usage.update({
                    where: { id: existingUsage.id },
                    data: {
                        profile_views_used: 0,
                        challenges_created: 0,
                        period_start: start,
                        period_end: end
                    }
                });
            } else {
                await tx.company_plan_usage.create({
                    data: {
                        company_id: validateCompany.id,
                        profile_views_used: 0,
                        challenges_created: 0,
                        period_start: start,
                        period_end: end
                    }
                });
            }
            return subscription;
        });
    }

    async subscribeTalent(id_user: string, plan_id: string, data: CreateTalentSubscriptionDto) {
        const validatePlan = await prisma.talent_plans.findUnique({ where: { id: plan_id } });
        if (!validatePlan) throw new Error("The talent plan does not exist");

        const validateProfile = await prisma.talent_profiles.findUnique({ where: { user_id: id_user } });
        if (!validateProfile) throw new Error("The talent profile does not exist");

        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(now.getMonth() + 1);

        return await prisma.talent_subscriptions.create({
            data: {
                id_profile: validateProfile.id,
                plan_id: plan_id,
                status: data.status,
                start_date: now,
                end_date: oneMonthLater,
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
                allowed: usage.profile_views_used !== null && features.max_profile_views_per_month !== null ? usage.profile_views_used < features.max_profile_views_per_month : false,
                reason: 'MAX_PROFILE_VIEWS_REACHED'
            },
            [CompanyActionType.CONTACT_TALENT]: {
                allowed: features.can_contact_talent ? features.can_contact_talent : false,
                reason: 'FEATURE_NOT_IN_PLAN'
            },
            [CompanyActionType.ADVANCED_FILTERS]: {
                allowed: features.can_use_advanced_filters !== null ? features.can_use_advanced_filters : false,
                reason: 'FEATURE_NOT_IN_PLAN'
            },
            [CompanyActionType.CREATE_CHALLENGE]: {
                allowed: features.can_create_custom_challenges !== null ? features.can_create_custom_challenges : false,
                reason: 'FEATURE_NOT_IN_PLAN'
            },
            [CompanyActionType.ACCESS_METRICS]: {
                allowed: features.can_access_metrics !== null ? features.can_access_metrics : false,
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

    async upgradeCompanySubscription(id_user: string, new_plan_id: string, data: CreateCompanySubscriptionDto) {
        return this.subscribeCompany(id_user, new_plan_id, data);
    }

    async upgradeTalentSubscription(id_user: string, new_plan_id: string, data: CreateTalentSubscriptionDto) {
        return this.subscribeTalent(id_user, new_plan_id, data);
    }

    async getCompanySubscription(id_user: string) {
        const validateCompany = await prisma.company.findUnique({ where: { id_user: id_user } });
        if (!validateCompany) throw new Error("The company does not exist");

        const subscription = await prisma.company_subscriptions.findFirst({
            where: {
                company_id: validateCompany.id,
                status: SubscriptionStatus.ACTIVE
            },
            include: {
                company_plans: {
                    include: {
                        company_plan_features: true
                    }
                }
            }
        });

        if (!subscription) return null;

        const usage = await prisma.company_plan_usage.findFirst({
            where: { company_id: validateCompany.id }
        });

        return {
            ...subscription,
            usage: usage || null
        };
    }

    async getTalentSubscription(id_user: string) {
        const validateProfile = await prisma.talent_profiles.findUnique({ where: { user_id: id_user } });
        if (!validateProfile) throw new Error("The talent profile does not exist");
        
        return await prisma.talent_subscriptions.findFirst({
            where: {
                id_profile: validateProfile.id,
                status: SubscriptionStatus.ACTIVE
            },
            include: {
                talent_plans: true
            }
        });
    }
}