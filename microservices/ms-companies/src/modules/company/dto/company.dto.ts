import { z } from "zod"
/**
* Validation scheme for creating a company.
* @remarks
* This scheme defines the typing of the received attributes,
* including validations for length, URL format, and UUID data types.
* @see {@link CreateCompanyDto} for the inferred TypeScript type.
* Attributes:
* @param name Name of company note : minimum size 1 character and maximum size 255 characters
* @param about Detailed description of the company's activity or purpose.
* @param location Physical or fiscal address. note : maximum 255 characters. 
* @param contact A flexible record for contact details (e.g., social media, phone numbers).
* @param example : { "whatsapp": "+123456789", "linkedin": "company/url" }
* @param url_logo URL pointing to the company's logo. Must be a valid URL or an empty string.
* @param goal The company's short-term goal or vision. 
* @param id_user Unique identifier of the owner user (UUID format).`delete param`
*/
export const CreateCompanySchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    about: z.string().min(1, "About description is required"),
    location: z.string().min(1,"Location is required").max(255),
    contact: z.record(z.string(), z.any()).optional(), 
    url_logo: z.url("Must be a valid URL").optional().or(z.literal("")),
    goal: z.string().optional(),
});


/**
* Schema for updating an existing company.
* @remarks
* Partial version of {@link CreateCompanySchema}.
* Ensures the update object is not empty.
* @throws {ZodError} If the provided object does not contain fields to update.
*/
export const UpdateCompanySchema = CreateCompanySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

/**
 * Data Transfer Object for creating companies.
 * @see {@link CreateCompanyDto}
 */
export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
/**
 * Data Transfer Object for update companies.
 * @see {@link CreateCompanyDto}
 */
export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
