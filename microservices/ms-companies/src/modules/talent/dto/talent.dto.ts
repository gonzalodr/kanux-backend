import { z } from "zod";

export const TalentSearchSchema = z.object({
    query: z.string().min(1, "At least one skill is required").transform(val => 
        val.trim().split(/\s+/).map(s => s.toLowerCase())
    )
});

export type TalentSearchDto = z.infer<typeof TalentSearchSchema>;