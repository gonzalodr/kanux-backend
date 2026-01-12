import { prisma } from "../../../lib/prisma";
import { CreateCompanyDto, UpdateCompanyDto } from "../dto/company.dto";
import axios from 'axios'

export class CompanyService {

    async registerCompany(id_user:string,data: CreateCompanyDto) {

        try {
            //Check if the base user is valid or already registered
            // const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://ms-auth:3000";
            // const userResponse   = await axios.get(`${authServiceUrl}/users/${id_user}`);
            
            const existingUser = await prisma.users.findFirst({where:{id: id_user}});
            if (!existingUser){throw new Error("The user does not exist.")}
            
            //validate if existing talent user
            const existingProfile = await prisma.talent_profiles.findFirst({where: {user_id: id_user}})
            if(existingProfile) { throw new Error("The user already has a registered like talent."); }
            
            // Validate if the base user already has a created or existing company
            const existingCompany = await prisma.company.findFirst({where: {id_user: id_user}});
            if (existingCompany) { throw new Error("The user already has a registered company."); }
            
            // create company to base user
            const company = await prisma.company.create({
                data: {
                    name: data.name,
                    about: data.about,
                    location: data.location,
                    contact: data.contact,
                    url_logo: data.url_logo,
                    goal: data.goal,
                    id_user: id_user
                }
            })
            /** simulation token */
            const token = "token-simulated";
            return { company, token }

        } catch(error:any) {
            if (error.response && error.response.status === 400) {
                throw new Error("The base user does not exist in the authentication system.");
            }
            throw new Error(error.message || "Error processing the record.");
        }
    }

    async updateCompany(id_company:string, data: UpdateCompanyDto){
        return ({succes: true})
    }
}