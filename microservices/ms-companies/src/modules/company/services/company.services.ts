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
            if (!existingCompany) throw new Error("The company record does not exist.");

            let finalLogoUrl = data.url_logo;

            // if have buffer, upload Cloudinary
            if (fileBuffer) {
                const upload = await uploadToCloudinary(fileBuffer, existingCompany.id);
                finalLogoUrl = upload.secure_url;
            }
            if(fileBuffer){
                console.log("filebuffer exist");
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
                    goal: data.goal,
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            email: true,
                            user_type: true,
                        }
                    }// include users data to create token
                }
            });

            const { users, ...company } = result;

            // validation if user is null
            if (!users) { throw new Error("The associated user was not found."); }

            const payload: JwtPayload = {
                userId: users.id,
                email: users.email,
                userType: users.user_type
            };

            const token = JwtUtil.generateToken(payload);

            return { company, token };

        } catch (error: any) {
            if (error.code === 'P2025') { throw new Error("The company record does not exist."); }
            throw new Error(error.message || "Error processing the record.");
        }
    }
}