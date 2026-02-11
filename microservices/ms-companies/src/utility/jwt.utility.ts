import "dotenv/config";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";


/**
 * interface JwtPayload, need to create token
 * @attribute userId: string
 * @attribute email: string
 * @attribute userType: string
 */
export interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
}

// get enviroments var to config jwt
const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN:SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "1h";

// validation
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export class JwtUtil {

/**
 * Generate a token
 * @param payload: JwtPayload : interfacer instance type of {@link JwtPayload}
 * @example
 * ```
 *  const payload: JwtPayload = {
 *      userId: "company-id",
 *      email: email,
 *      userType: "company"
 *  };
 * ```
 * 
 */
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN,});
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}