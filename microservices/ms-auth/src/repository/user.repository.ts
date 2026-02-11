import { prisma } from "../lib/prisma";
import { users } from "@prisma/client";



export class UserRepository{

    static async findByEmail(email:string): Promise<users | null> {
    return prisma.users.findUnique({where:{email},});
    }

    static async findAuthUserByEmail(email: string)  {
  return prisma.users.findUnique({
    where: { email },
    include: {
      company: true,
      talent_profiles: true,
    },
  });
}

  static async create(data: {
    email: string;
    password_hash: string;
    user_type: string;
  }): Promise<users> {
    return prisma.users.create({
      data,
    });
  }

}