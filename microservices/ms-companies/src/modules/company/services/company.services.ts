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
            if (existingCompany) throw new Error("A company for this user already exists.");

            const existUser = await prisma.users.findUnique({ where: { id: id_user } });
            if (!existUser) { throw new Error("The associated user was not found."); }

            let finalLogoUrl = data.url_logo;
            // if have buffer, upload Cloudinary
            if (fileBuffer) {
                const upload = await uploadToCloudinary(fileBuffer, id_user);
                finalLogoUrl = upload.secure_url;
            }

            //We update and bring the related user in a single step
            const result = await prisma.company.create({
                data: {
                    name: data.name,
                    about: data.about,
                    location: data.location,
                    contact: data.contact,
                    url_logo: finalLogoUrl,
                    goal: data.goal,
                    id_user: id_user
                },
                include: {
                    users: true
                }
            });
            const { users, ...company } = result;
            // validation if user is null
            if (!users) { throw new Error("The associated user was not found."); }

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