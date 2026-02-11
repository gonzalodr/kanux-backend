import { prisma } from "../../../lib/prisma";
import { TalentSearchDto } from "../dto/talent.dto";



export class TalentServices {

    async searchTalent(data: TalentSearchDto) {
        try {
            const { query } = data;
            //searching talent
            const talents = await prisma.talent_profiles.findMany({
                where: {
                    OR: query.flatMap(word => [
                        { first_name: { contains: word, mode: 'insensitive' } },
                        { last_name: { contains: word, mode: 'insensitive' } },
                        { location: { contains: word, mode: 'insensitive' } },
                        { title: { contains: word, mode: 'insensitive' } },
                        { experience_level: { contains: word, mode: 'insensitive' } },
                        {
                            skills: {
                                some: { name: { contains: word, mode: 'insensitive' } }
                            }
                        }
                    ])
                },
                include: { skills: true }
            });

            //calculate match
            const results = talents.map(talent => {
                return { ...talent, match_score: this.calculateMatch(talent, query)};
            });
            // return search results 
            return results.sort((a, b) => b.match_score - a.match_score);
        } catch (error: any) {
            throw new Error("Error processing talent search")
        }
    }
    
    private calculateMatch(talent: any, queryWords: string[]): number {
        let matches = 0;
        //get data from talent profile entity
        const searchableText = [
            talent.first_name,
            talent.last_name,
            talent.location,
            talent.title,
            ...talent.skills.map((s: any) => s.name)
        ].join(" ").toLowerCase();
        // calculate match and coincidenc
        queryWords.forEach(word => {
            if (searchableText.includes(word)) matches++;
        });

        return Math.round((matches / queryWords.length) * 100);
    }
}