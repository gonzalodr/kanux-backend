import { prisma } from "../../../lib/prisma";
import { CreateCompanyDto } from "../dto/company.dto";

export class CompanyService{

    async registerCompany(data:CreateCompanyDto){
        const company = await prisma.company.create({
            data:{
                name: data.name,
                about:data.about,
                location: data.location,
                contact: data.contact,
                url_logo:data.url_logo,
                goal:data.goal,
                id_user: data.id_user
            }
        })
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
        return {company, token}
    }
}