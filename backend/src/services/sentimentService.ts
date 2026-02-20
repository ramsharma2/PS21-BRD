import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../index';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface SentimentAnalysisResult {
    overallScore: number; // -1 to 1
    sentiment: 'positive' | 'neutral' | 'negative';
    breakdown: {
        functional: number;
        nonFunctional: number;
        constraints: number;
    };
    stakeholderConcerns: string[];
    suggestions: string[];
}

export const analyzeSentiment = async (projectId: string): Promise<SentimentAnalysisResult> => {
    // 1. Fetch project data (requirements and constraints)
    const requirements = await prisma.extraction.findMany({
        where: { projectId },
        select: { content: true, category: true }
    });

    if (requirements.length === 0) {
        return {
            overallScore: 0,
            sentiment: 'neutral',
            breakdown: { functional: 0, nonFunctional: 0, constraints: 0 },
            stakeholderConcerns: [],
            suggestions: []
        };
    }

    // 2. Prepare prompt
    const reqText = requirements.map(r => `- [${r.category}] ${r.content}`).join('\n').substring(0, 10000); // Limit context

    const prompt = `
    Analyze the sentiment and tone of the following project requirements.
    Determine if the requirements are phrased positively (constructive, clear), neutrally, or negatively (restrictive, ambiguous, conflict-prone).
    
    Requirements:
    ${reqText}

    Return a JSON object with:
    - overallScore: number between -1 (negative) and 1 (positive)
    - sentiment: "positive", "neutral", "negative"
    - breakdown: { functional: score, nonFunctional: score, constraints: score } (scores -1 to 1)
    - stakeholderConcerns: list of potential concerns based on tone (e.g., "High ambiguity", "Strict constraints")
    - suggestions: list of ways to improve the tone/clarity
  `;

    // 3. Call AI
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as SentimentAnalysisResult;
        }
    } catch (error) {
        console.error("Sentiment analysis failed:", error);
    }

    // Fallback
    return {
        overallScore: 0,
        sentiment: 'neutral',
        breakdown: { functional: 0, nonFunctional: 0, constraints: 0 },
        stakeholderConcerns: ["Analysis failed"],
        suggestions: []
    };
};
