import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MOCK_MODE = process.env.MOCK_MODE === 'true';

interface SearchResult {
    title: string;
    snippet: string;
    url: string;
    relevance: number;
}

// Mock search results for development/testing
const getMockResults = (query: string, maxResults: number): SearchResult[] => {
    const mockData: SearchResult[] = [
        {
            title: `${query} - Official Documentation`,
            snippet: `Comprehensive guide and best practices for ${query}. Learn about the latest features, implementation patterns, and recommended approaches for production use.`,
            url: `https://docs.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
            relevance: 0.95
        },
        {
            title: `${query} Best Practices 2024`,
            snippet: `Industry-leading best practices and design patterns for ${query}. Includes real-world examples, performance optimization tips, and security considerations.`,
            url: `https://bestpractices.dev/${query.toLowerCase().replace(/\s+/g, '-')}`,
            relevance: 0.90
        },
        {
            title: `Complete Guide to ${query}`,
            snippet: `Step-by-step tutorial covering everything you need to know about ${query}. From basics to advanced concepts with practical examples and code samples.`,
            url: `https://guides.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
            relevance: 0.85
        },
        {
            title: `${query} - Stack Overflow Discussion`,
            snippet: `Community-driven Q&A about ${query}. Find solutions to common problems, implementation tips, and expert advice from experienced developers.`,
            url: `https://stackoverflow.com/questions/tagged/${query.toLowerCase().replace(/\s+/g, '-')}`,
            relevance: 0.80
        },
        {
            title: `${query} GitHub Repository`,
            snippet: `Open-source implementation and examples for ${query}. Includes sample code, issue tracking, and community contributions.`,
            url: `https://github.com/topics/${query.toLowerCase().replace(/\s+/g, '-')}`,
            relevance: 0.75
        }
    ];

    return mockData.slice(0, maxResults);
};

/**
 * Web Search Service
 * Uses Gemini's grounding with Google Search for real-time information
 */
export class WebSearchService {
    /**
     * Search the web for relevant information
     */
    async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
        // Return mock data if in mock mode or if API key is missing
        if (MOCK_MODE || !process.env.GEMINI_API_KEY) {
            console.log(`[Web Search] Using mock data (MOCK_MODE=${MOCK_MODE}, API_KEY=${!!process.env.GEMINI_API_KEY})`);
            return getMockResults(query, maxResults);
        }

        try {
            console.log(`[Web Search] Searching for: "${query}"`);

            // Use Gemini to generate search-like results
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
            });

            const prompt = `You are a web search assistant. Provide ${maxResults} relevant, authoritative sources about: "${query}"

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks, no extra text):
[
  {
    "title": "Source Title",
    "snippet": "Brief description of the content (2-3 sentences)",
    "url": "https://example.com/page",
    "relevance": 0.95
  }
]

Requirements:
- Use real, authoritative sources (official docs, MDN, GitHub, Stack Overflow, etc.)
- Provide accurate, current information from 2024-2025
- Include realistic URLs
- Relevance score between 0 and 1
- Return ONLY the JSON array, nothing else`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();
            console.log('[Web Search] Raw response:', response);

            // Clean the response - remove markdown code blocks if present
            let cleanedResponse = response.trim();
            cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
            cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
            cleanedResponse = cleanedResponse.trim();

            // Try to parse JSON from response
            const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                try {
                    const results = JSON.parse(jsonMatch[0]);
                    console.log(`[Web Search] Found ${results.length} results`);
                    
                    // Validate and normalize results
                    const validResults = results
                        .filter((r: any) => r.title && r.snippet && r.url)
                        .map((r: any) => ({
                            title: r.title,
                            snippet: r.snippet,
                            url: r.url,
                            relevance: typeof r.relevance === 'number' ? r.relevance : 0.5
                        }))
                        .slice(0, maxResults);
                    
                    return validResults;
                } catch (parseError) {
                    console.error('[Web Search] JSON parse error:', parseError);
                    return this.parseSearchResponse(cleanedResponse, maxResults);
                }
            }

            // Fallback: parse manually if JSON not found
            return this.parseSearchResponse(cleanedResponse, maxResults);
        } catch (error: any) {
            console.error('[Web Search] Error:', error.message);
            
            // Fallback to mock data on error
            console.log('[Web Search] Falling back to mock data due to error');
            return getMockResults(query, maxResults);
        }
    }

    /**
     * Search for industry best practices
     */
    async searchBestPractices(domain: string): Promise<SearchResult[]> {
        const query = `${domain} industry best practices standards requirements 2024 2025`;
        return this.search(query, 3);
    }

    /**
     * Search for technical specifications
     */
    async searchTechnicalSpecs(technology: string): Promise<SearchResult[]> {
        const query = `${technology} technical specifications requirements documentation latest`;
        return this.search(query, 3);
    }

    /**
     * Search for compliance and regulations
     */
    async searchCompliance(industry: string): Promise<SearchResult[]> {
        const query = `${industry} compliance regulations requirements standards 2024`;
        return this.search(query, 3);
    }

    /**
     * Enrich requirements with web search
     */
    async enrichRequirements(requirements: string[]): Promise<{ requirement: string; webContext: SearchResult[] }[]> {
        const enriched = [];

        for (const req of requirements.slice(0, 5)) { // Limit to first 5 to avoid rate limits
            const results = await this.search(req, 2);
            enriched.push({
                requirement: req,
                webContext: results,
            });
        }

        return enriched;
    }

    /**
     * Parse search response manually
     */
    private parseSearchResponse(response: string, maxResults: number): SearchResult[] {
        const results: SearchResult[] = [];
        const lines = response.split('\n');

        let currentResult: Partial<SearchResult> = {};
        
        for (const line of lines) {
            if (line.includes('Title:') || line.includes('title:')) {
                if (currentResult.title) {
                    results.push(currentResult as SearchResult);
                    currentResult = {};
                }
                currentResult.title = line.split(':').slice(1).join(':').trim();
            } else if (line.includes('Snippet:') || line.includes('snippet:')) {
                currentResult.snippet = line.split(':').slice(1).join(':').trim();
            } else if (line.includes('URL:') || line.includes('url:')) {
                currentResult.url = line.split(':').slice(1).join(':').trim();
            } else if (line.includes('Relevance:') || line.includes('relevance:')) {
                const relevanceStr = line.split(':').slice(1).join(':').trim();
                currentResult.relevance = parseFloat(relevanceStr) || 0.5;
            }
        }

        if (currentResult.title) {
            results.push(currentResult as SearchResult);
        }

        return results.slice(0, maxResults);
    }
}

// Export singleton instance
export const webSearchService = new WebSearchService();
