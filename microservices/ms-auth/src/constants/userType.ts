export enum UserType {
  TALENT = "talent",
  COMPANY = "company",
}

export class EmailUtil {
  static isValid(email: string): boolean {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return emailRegex.test(email);
  }
}