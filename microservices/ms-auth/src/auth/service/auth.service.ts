import { UserType } from "../../constants/userType";
import { PasswordUtil } from "../../utils/security/password.util";
import { UserRepository } from "../../repository/user.repository";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import { JwtUtil } from "../../utils/security/jwt.util";
import { talent_profiles, company } from "@prisma/client";

interface LoginDTO {
  email: string;
  password: string;
}


export class AuthService {

  static async preRegister(data: {
    email: string;
    password: string;
    userType: string;
  }) {
     const { email, password, userType } = data;
    

    if (!Object.values(UserType).includes(userType as UserType)) {
      throw new Error("INVALID_USER_TYPE");
    }

    const existingUser = await UserRepository.findByEmail(email);
     if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    return prisma.$transaction(async (tx) => {

      const password_hash = await PasswordUtil.hash(password);

      const user = await UserRepository.create(
       {
          email,
          password_hash,
          user_type: userType,
        }
      );

       if (userType === UserType.TALENT) {
        await tx.talent_profiles.create({
          data: { user_id: user.id },
        });
      }else{
        if (userType === UserType.COMPANY) {
        await tx.company.create({
          data: { id_user: user.id },
        });
      }
      }
    

    return {
      success: true,
      user: user.id,
      nextStep:
        userType === UserType.TALENT
          ? "REGISTER_TALENT"
          : "REGISTER_COMPANY",
    };
  });
  }


static async login({ email, password }: LoginDTO) {

    const user = await UserRepository.findAuthUserByEmail(email);

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = JwtUtil.generateToken({
      userId: user.id,
      email: user.email,
      userType: user.user_type,
    });

    const profile =
    user.user_type === "company"
      ? user.company
      : user.talent_profiles;

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        profile:profile,
      },
    };
  }


}
