import { Request, Response, NextFunction } from "express";
import axios from "axios"; // Necesitarás instalar axios o usar fetch
import { CompanyActionType } from "../modules/subscriptions/enums/actionType.enum";

// URL base de tu microservicio de suscripciones (usualmente viene de variables de entorno)
const SUBSCRIPTION_SERVICE_URL = process.env.SUBSCRIPTION_SERVICE_URL || "http://localhost";
const PORT = process.env.MS_SUBSCRIPTIONS_PORT || 3005;

const url = `${SUBSCRIPTION_SERVICE_URL}:${PORT}`


export const limitGuard = (action: CompanyActionType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { id_company } = req.params;

        try {
            // endpoint
            const response = await axios.get(`${url}/company/${id_company}/validate`,
                {
                    params: { action }
                }
            );

            if (response.data.success && response.data.allowed) {
                return next();
            }
            return res.status(403).json(response.data);

        } catch (error: any) {
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            return res.status(502).json({
                success: false,
                message: "Subscription service is unavailable",
                error: error.message
            });
        }
    };
};
