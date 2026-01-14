import { Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { EmailUtil } from "../../constants/userType";
import { UserType } from "../../constants/userType";

interface PreRegisterDTO {
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
}





export class AuthController {

  // POST /auth/pre-register
  static async preRegister(req: Request, res: Response) {
   const { userType, email,password, confirmPassword } = req.body as PreRegisterDTO;

  if (!userType) {
    return res.status(400).json({
      error: "userType es requerido.",
    });
  }

  if(!email||!password||!confirmPassword){
     return res.status(400).json({
      error: "Todos los campos son requeridos.",
    });
  }

  if (!EmailUtil.isValid(email)) {
  return res.status(400).json({
    error: "El correo electrónico no tiene un formato válido.",
  });
}

  if(password!=confirmPassword){
     return res.status(400).json({
      error: "Las contraseñas no coinciden.",
    });
  }

  try {
    const result = await AuthService.preRegister( {
  email,
  password,
  userType,
});
    return res.status(201).json(result);

  } catch (error: any) {
     return AuthController.handleError(error, res);
  }
  }

  // POST /auth/login
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if(!email||!password){
     return res.status(400).json({
      error: "Todos los campos son requeridos.",
    });
  }

      const result = await AuthService.login({ email, password });

      return res.status(200).json(result);

    } catch (error: any) {
      return AuthController.handleError(error, res);
    }
  }


  private static handleError(error: any, res: Response) {
    switch (error.message) {
      case "INVALID_CREDENTIALS":
        return res.status(401).json({
          message: "Correo o contraseña invalida",
        });

      case "EMAIL_ALREADY_EXISTS":
        return res.status(409).json({
          message: "El correo se encuentra asociado a otra cuenta.",
        });

      case "INVALID_USER_TYPE":
        return res.status(400).json({
          message: "Tipo de usuario invalido",
        });

      default:
        console.error(error);
        return res.status(500).json({
          message: "Internal server error",
        });
    }
  }
}