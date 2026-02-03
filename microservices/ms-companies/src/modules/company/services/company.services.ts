import { prisma } from "../../../lib/prisma";
import { CreateCompanyDto, UpdateCompanyDto } from "../dto/company.dto";
import { JwtUtil, JwtPayload } from "../../../utility/jwt.utility";
import { uploadToCloudinary } from "../../../utility/claudinary.utility";


export class CompanyService {

    /**
     * method that registers the company with all the requested data
     * @param id_company 
     * @param data 
     * @param file
     * @returns Promise<?>
     */
    async registerCompany(id_user: string, data: CreateCompanyDto, fileBuffer?: Buffer) {
        try {
            const existingCompany = await prisma.company.findUnique({ where: { id_user } });
            if (!existingCompany) throw new Error("A company does not exist.");

            const existUser = await prisma.users.findUnique({ where: { id: id_user } });
            if (!existUser) { throw new Error("The associated user was not found."); }

            let finalLogoUrl = data.url_logo;
            // if have buffer, upload Cloudinary
            if (fileBuffer) {
                const upload = await uploadToCloudinary(fileBuffer, id_user);
                finalLogoUrl = upload.secure_url;
            }

            //We update and bring the related user in a single step
            const result = await prisma.company.update({
                where: { id_user: id_user },
                data: {
                    name: data.name,
                    about: data.about,
                    location: data.location,
                    contact: data.contact,
                    url_logo: finalLogoUrl,
                    goal: data.goal
                },
                include: {
                    users: true
                }
            });
            const { users, ...company } = result;
            // validation if user is null
            if (!users) { throw new Error("The associated user was not found."); }

            // get free plan
            const freePlan = await prisma.company_plans.findFirst({
                where: { price_monthly: 0 }
            });
            if (!freePlan) {
                throw new Error("Free company plan not found in the database. Please configure a free plan.");
            }
            await prisma.$transaction(async (tx) => {
                // Deactivate any existing active subscriptions for this company
                await tx.company_subscriptions.updateMany({
                    where: { company_id: company.id, status: 'active'},
                    data: { status: 'active' }
                });

                const now = new Date();
                const oneMonthLater = new Date();
                oneMonthLater.setMonth(now.getMonth() + 1);

                // Create the new free subscription
                await tx.company_subscriptions.create({
                    data: {
                        company_id: company.id,
                        plan_id: freePlan.id,
                        status: 'active',
                        start_date: now,
                        end_date: oneMonthLater,
                    }
                });

                // create
                const existingUsage = await tx.company_plan_usage.findFirst({ where: { company_id: company.id } });

                if (existingUsage) {
                    await tx.company_plan_usage.update({
                        where: { id: existingUsage.id },
                        data: {
                            profile_views_used: 0,
                            challenges_created: 0,
                            period_start: now,
                            period_end: oneMonthLater
                        }
                    });
                } else {
                    await tx.company_plan_usage.create({
                        data: {
                            company_id: company.id,
                            profile_views_used: 0,
                            challenges_created: 0,
                            period_start: now,
                            period_end: oneMonthLater
                        }
                    });
                }
            });
            // --- End: Automatic Free Plan Subscription Logic ---

            return { 
                success: true,
                user:{
                    id: users.id,
                    email: users.email,
                    user_type: users.user_type,
                    profile: company
                } 
            };

        } catch (error: any) {
            if (error.code === 'P2025') { throw new Error("The company record does not exist."); }
            throw new Error(error.message || "Error processing the record.");
        }
    }
}
