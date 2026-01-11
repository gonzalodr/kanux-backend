import { Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { EmailUtil } from "../../constants/userType";

export const preRegister = async (req: Request, res: Response) => {
  const { userType, email,password, confirmPassword } = req.body;

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
    const result = await AuthService.preRegister( req.body);
    return res.status(200).json(result);

  } catch (error: any) {
    if (error.message === "INVALID_USER_TYPE") {
      return res.status(400).json({
        error: "Tipo de usuario inválido. Use 'talent' o 'company'.",
      });
    }
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(400).json({
        error: "El correo ya se encuentra asociado a una cuenta.",
      });
    }

    return res.status(500).json({
      error: "Error interno del MS-AUTH",
    });
  }
};
