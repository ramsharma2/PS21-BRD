import { Router } from 'express';
import { webSearchService } from '../services/webSearchService';

const router = Router();

/**
 * General web search
 */
router.post('/web', async (req, res) => {
    try {
        const { query, maxResults = 5 } = req.body;

        if (!query) {
            return res.status(400).json({ 
                success: false,
                error: 'Query is required' 
            });
        }

        console.log('[Search Route] Web search request:', { query, maxResults });

        const results = await webSearchService.search(query, maxResults);

        console.log('[Search Route] Search completed:', { count: results.length });

        return res.json({
            success: true,
            data: {
                query,
                results,
                count: results.length,
            }
        });
    } catch (error: any) {
        console.error('[Search Route] Error in web search:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to perform web search' 
        });
    }
});

/**
 * Search for best practices
 */
router.post('/best-practices', async (req, res) => {
    try {
        const { domain } = req.body;

        if (!domain) {
            return res.status(400).json({ 
                success: false,
                error: 'Domain is required' 
            });
        }

        console.log('[Search Route] Best practices search:', { domain });

        const results = await webSearchService.searchBestPractices(domain);

        return res.json({
            success: true,
            data: {
                domain,
                results,
                count: results.length,
            }
        });
    } catch (error: any) {
        console.error('[Search Route] Error searching best practices:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to search best practices' 
        });
    }
});

/**
 * Search for technical specifications
 */
router.post('/technical-specs', async (req, res) => {
    try {
        const { technology } = req.body;

        if (!technology) {
            return res.status(400).json({ 
                success: false,
                error: 'Technology is required' 
            });
        }

        console.log('[Search Route] Technical specs search:', { technology });

        const results = await webSearchService.searchTechnicalSpecs(technology);

        return res.json({
            success: true,
            data: {
                technology,
                results,
                count: results.length,
            }
        });
    } catch (error: any) {
        console.error('[Search Route] Error searching technical specs:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to search technical specs' 
        });
    }
});

/**
 * Search for compliance information
 */
router.post('/compliance', async (req, res) => {
    try {
        const { industry } = req.body;

        if (!industry) {
            return res.status(400).json({ 
                success: false,
                error: 'Industry is required' 
            });
        }

        console.log('[Search Route] Compliance search:', { industry });

        const results = await webSearchService.searchCompliance(industry);

        return res.json({
            success: true,
            data: {
                industry,
                results,
                count: results.length,
            }
        });
    } catch (error: any) {
        console.error('[Search Route] Error searching compliance:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to search compliance' 
        });
    }
});

/**
 * Enrich requirements with web context
 */
router.post('/enrich-requirements', async (req, res) => {
    try {
        const { requirements } = req.body;

        if (!requirements || !Array.isArray(requirements)) {
            return res.status(400).json({ 
                success: false,
                error: 'Requirements array is required' 
            });
        }

        console.log('[Search Route] Enriching requirements:', { count: requirements.length });

        const enriched = await webSearchService.enrichRequirements(requirements);

        return res.json({
            success: true,
            data: {
                enriched,
                count: enriched.length,
            }
        });
    } catch (error: any) {
        console.error('[Search Route] Error enriching requirements:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to enrich requirements' 
        });
    }
});

export default router;
