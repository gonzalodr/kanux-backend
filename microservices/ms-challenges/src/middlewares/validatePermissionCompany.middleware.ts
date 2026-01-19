import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export enum CompanyActionType {
    VIEW_PROFILE = 'VIEW_PROFILE',
    CONTACT_TALENT = 'CONTACT_TALENT',
    ADVANCED_FILTERS = 'ADVANCED_FILTERS',
    CREATE_CHALLENGE = 'CREATE_CHALLENGE',
    ACCESS_METRICS = 'ACCESS_METRICS',
    ACCESS_REPORTS = 'ACCESS_REPORTS'
}

export const checkSubscriptionPermission = (actionType: CompanyActionType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id_company = req.params.id_company || (req as any).user?.company_id;
      if (!id_company) {
        return res.status(400).json({ message: "Company ID is required for subscription validation" });
      }

      const SUBSCRIPTION_SERVICE_URL = process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3005';
      
      const response = await axios.get(`${SUBSCRIPTION_SERVICE_URL}/validate/${id_company}`, {
        params: { action: actionType }
      });

      const { allowed, success } = response.data;

      if (!success || !allowed) {
        return res.status(403).json(response.data); // Devolvemos el error original del ms-subscription
      }

      next();

    } catch (error: any) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(500).json({ 
        success: false, 
        message: "Error connecting to subscription service" 
      });
    }
  };
};