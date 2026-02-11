import { Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { EmailUtil } from "../../constants/userType";
import { UserType } from "../../constants/userType";

interface PreRegisterDTO {
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  deviceId?: string;
}

export class AuthController {
  static async preRegister(req: Request, res: Response) {
    const { userType, email, password, confirmPassword, deviceId } =
      req.body as PreRegisterDTO;

    if (!userType) {
      return res.status(400).json({
        error: "userType es requerido.",
      });
    }

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        error: "Todos los campos son requeridos.",
      });
    }

    if (!EmailUtil.isValid(email)) {
      return res.status(400).json({
        error: "El correo electrónico no tiene un formato válido.",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        error: "Las contraseñas no coinciden.",
      });
    }

    try {
      const result = await AuthService.preRegister({
        email,
        password,
        userType,
        deviceId,
      });
      return res.status(201).json(result);
    } catch (error: any) {
      return AuthController.handleError(error, res);
    }
  }
  static async login(req: Request, res: Response) {
    try {
      const { email, password, deviceId } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Todos los campos son requeridos.",
        });
      }

      const result = await AuthService.login({ email, password, deviceId });

      return res.status(200).json(result);
    } catch (error: any) {
      return AuthController.handleError(error, res);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          error: "sessionId es requerido.",
        });
      }

      const success = AuthService.logout(sessionId);

      if (!success) {
        return res.status(404).json({
          error: "Sesión no encontrada.",
        });
      }

      return res.status(200).json({
        message: "Sesión cerrada exitosamente.",
      });
    } catch (error: any) {
      return AuthController.handleError(error, res);
    }
  }

  static async logoutAll(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          error: "No autorizado.",
        });
      }

      const success = AuthService.logoutAllDevices(req.user.userId);

      return res.status(200).json({
        message: success
          ? "Todas las sesiones han sido cerradas."
          : "No había sesiones activas.",
      });
    } catch (error: any) {
      return AuthController.handleError(error, res);
    }
  }

  static async verifySession(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          valid: false,
          error: "No authorization header provided",
        });
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      const result = AuthService.verifySession(token);

      return res.status(200).json(result);
    } catch (error: any) {
      return AuthController.handleError(error, res);
    }
  }

  static async getSessions(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          error: "No autorizado.",
        });
      }

      const sessions = AuthService.getUserActiveSessions(req.user.userId);

      return res.status(200).json({
        sessions,
        count: sessions.length,
      });
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
