import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import {
    BRD_SYSTEM_PROMPT,
    createExecutiveSummaryPrompt,
    createFunctionalRequirementsPrompt,
} from '../utils/prompts';
import { extractionService } from './extractionService';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MOCK_MODE = process.env.MOCK_MODE === 'true';

interface BRDSection {
    [key: string]: any;
}

/**
 * BRD Generator Service
 * Generates comprehensive Business Requirements Documents from extracted information
 */
export class BRDGeneratorService {
    /**
     * Generate a complete BRD for a project
     * @param projectId - Project ID
     * @param onProgress - Optional callback for streaming progress updates
     */
    async generateBRD(
        projectId: string,
        onProgress?: (section: string, content: any) => void
    ): Promise<string> {
        console.log(`Starting BRD generation for project ${projectId}...`);

        // Get all extractions grouped by category
        const extractions = await extractionService.getExtractionsByCategory(projectId);

        // Check if we have enough data
        if (Object.keys(extractions).length === 0) {
            throw new Error('No extracted information available. Please run extraction first.');
        }

        // Generate each section
        const sections: BRDSection = {};

        // 1. Executive Summary
        if (onProgress) onProgress('executive_summary', { status: 'generating' });
        sections.executiveSummary = await this.generateExecutiveSummary(extractions);
        if (onProgress) onProgress('executive_summary', sections.executiveSummary);

        // 2. Business Objectives
        if (onProgress) onProgress('business_objectives', { status: 'generating' });
        sections.businessObjectives = await this.generateBusinessObjectives(extractions);
        if (onProgress) onProgress('business_objectives', sections.businessObjectives);

        // 3. Stakeholder Analysis
        if (onProgress) onProgress('stakeholder_analysis', { status: 'generating' });
        sections.stakeholderAnalysis = await this.generateStakeholderAnalysis(extractions);
        if (onProgress) onProgress('stakeholder_analysis', sections.stakeholderAnalysis);

        // 4. Scope
        if (onProgress) onProgress('scope', { status: 'generating' });
        sections.scope = await this.generateScope(extractions);
        if (onProgress) onProgress('scope', sections.scope);

        // 5. Functional Requirements
        if (onProgress) onProgress('functional_requirements', { status: 'generating' });
        sections.functionalRequirements = await this.generateFunctionalRequirements(extractions);
        if (onProgress) onProgress('functional_requirements', sections.functionalRequirements);

        // 6. Non-Functional Requirements
        if (onProgress) onProgress('nonfunctional_requirements', { status: 'generating' });
        sections.nonFunctionalRequirements = await this.generateNonFunctionalRequirements(extractions);
        if (onProgress) onProgress('nonfunctional_requirements', sections.nonFunctionalRequirements);

        // 7. Assumptions & Dependencies
        if (onProgress) onProgress('assumptions', { status: 'generating' });
        sections.assumptions = await this.generateAssumptions(extractions);
        if (onProgress) onProgress('assumptions', sections.assumptions);

        // 8. Constraints
        if (onProgress) onProgress('constraints', { status: 'generating' });
        sections.constraints = await this.generateConstraints(extractions);
        if (onProgress) onProgress('constraints', sections.constraints);

        // 9. Risks & Open Questions
        if (onProgress) onProgress('risks', { status: 'generating' });
        sections.risks = await this.generateRisks(extractions);
        if (onProgress) onProgress('risks', sections.risks);

        // 10. Success Metrics
        if (onProgress) onProgress('success_metrics', { status: 'generating' });
        sections.successMetrics = await this.generateSuccessMetrics(extractions);
        if (onProgress) onProgress('success_metrics', sections.successMetrics);

        // 11. Timeline & Milestones
        if (onProgress) onProgress('timeline', { status: 'generating' });
        sections.timeline = await this.generateTimeline(extractions);
        if (onProgress) onProgress('timeline', sections.timeline);

        // 12. Glossary
        if (onProgress) onProgress('glossary', { status: 'generating' });
        sections.glossary = await this.generateGlossary(extractions);
        if (onProgress) onProgress('glossary', sections.glossary);

        // Store BRD in database
        const brd = await this.saveBRD(projectId, sections);

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'ready' },
        });

        console.log(`✓ BRD generation complete for project ${projectId}`);
        return brd.id;
    }

    /**
     * Generate Executive Summary section
     */
    private async generateExecutiveSummary(extractions: Record<string, any[]>): Promise<any> {
        if (MOCK_MODE) {
            return {
                overview: 'This project aims to develop a comprehensive software solution that addresses key business needs.',
                scope: 'The system will include user authentication, data management, and reporting capabilities.',
                objectives: ['Improve operational efficiency', 'Enhance user experience', 'Reduce manual processes'],
                stakeholders: ['Product Owner', 'Development Team', 'End Users'],
                timeline: 'Q2 2025',
            };
        }

        const allExtractions = Object.values(extractions).flat();
        const prompt = createExecutiveSummaryPrompt(allExtractions);

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            systemInstruction: BRD_SYSTEM_PROMPT,
        });

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { overview: 'Unable to generate executive summary', scope: '', objectives: [], stakeholders: [], timeline: null };
    }

    /**
     * Generate Business Objectives section
     */
    private async generateBusinessObjectives(extractions: Record<string, any[]>): Promise<any> {
        const objectives = extractions.objective || [];

        if (MOCK_MODE || objectives.length === 0) {
            return {
                primary: ['Increase user engagement by 30%', 'Reduce operational costs by 20%'],
                secondary: ['Improve customer satisfaction', 'Streamline workflows'],
                strategicAlignment: 'Aligns with company digital transformation initiative',
            };
        }

        // Use Gemini to synthesize objectives
        const prompt = `Based on these extracted objectives, create a structured business objectives section:

${JSON.stringify(objectives, null, 2)}

Respond with JSON:
{
  "primary": ["string"],
  "secondary": ["string"],
  "strategicAlignment": "string"
}`;

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            systemInstruction: BRD_SYSTEM_PROMPT,
        });

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { primary: [], secondary: [], strategicAlignment: '' };
    }

    /**
     * Generate Stakeholder Analysis section
     */
    private async generateStakeholderAnalysis(extractions: Record<string, any[]>): Promise<any> {
        const stakeholders = extractions.stakeholder || [];

        if (MOCK_MODE || stakeholders.length === 0) {
            return {
                stakeholders: [
                    {
                        name: 'Product Owner',
                        role: 'Decision Maker',
                        interest: 'High',
                        concerns: ['Timeline adherence', 'Budget constraints'],
                        communicationPreference: 'Weekly status meetings',
                    },
                ],
            };
        }

        const prompt = `Based on these extracted stakeholder mentions, create a stakeholder analysis:

${JSON.stringify(stakeholders, null, 2)}

Respond with JSON:
{
  "stakeholders": [
    {
      "name": "string",
      "role": "string",
      "interest": "High | Medium | Low",
      "concerns": ["string"],
      "communicationPreference": "string"
    }
  ]
}`;

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            systemInstruction: BRD_SYSTEM_PROMPT,
        });

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { stakeholders: [] };
    }

    /**
     * Generate Scope section
     */
    private async generateScope(extractions: Record<string, any[]>): Promise<any> {
        const requirements = [
            ...(extractions.functional_req || []),
            ...(extractions.nonfunctional_req || []),
        ];

        if (MOCK_MODE || requirements.length === 0) {
            return {
                inScope: ['User authentication and authorization', 'Data management dashboard', 'Reporting module'],
                outOfScope: ['Mobile application', 'Third-party integrations', 'Advanced analytics'],
            };
        }

        const prompt = `Based on these requirements, define what is in-scope and out-of-scope:

${JSON.stringify(requirements.slice(0, 20), null, 2)}

Respond with JSON:
{
  "inScope": ["string"],
  "outOfScope": ["string"]
}`;

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            systemInstruction: BRD_SYSTEM_PROMPT,
        });

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { inScope: [], outOfScope: [] };
    }

    /**
     * Generate Functional Requirements section
     */
    private async generateFunctionalRequirements(extractions: Record<string, any[]>): Promise<any> {
        const functionalReqs = extractions.functional_req || [];

        if (MOCK_MODE || functionalReqs.length === 0) {
            return {
                requirements: [
                    {
                        id: 'FR-001',
                        description: 'System must support user login with email and password',
                        priority: 'must_have',
                        acceptanceCriteria: ['User can login with valid credentials', 'Invalid credentials show error message'],
                        citations: [1, 2],
                    },
                ],
            };
        }

        const prompt = createFunctionalRequirementsPrompt(functionalReqs);

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            systemInstruction: BRD_SYSTEM_PROMPT,
        });

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { requirements: [] };
    }

    /**
     * Generate Non-Functional Requirements section
     */
    private async generateNonFunctionalRequirements(extractions: Record<string, any[]>): Promise<any> {
        const nfrs = extractions.nonfunctional_req || [];

        if (MOCK_MODE || nfrs.length === 0) {
            return {
                performance: ['System must support 1000 concurrent users', 'Page load time under 2 seconds'],
                security: ['All data must be encrypted at rest and in transit', 'Role-based access control'],
                scalability: ['System must scale horizontally'],
                reliability: ['99.9% uptime SLA'],
            };
        }

        // Similar Gemini call for NFRs
        return { performance: [], security: [], scalability: [], reliability: [] };
    }

    /**
     * Generate remaining sections (simplified for now)
     */
    private async generateAssumptions(extractions: Record<string, any[]>): Promise<any> {
        const assumptions = extractions.assumption || [];
        return { assumptions: assumptions.map((a) => a.content) };
    }

    private async generateConstraints(extractions: Record<string, any[]>): Promise<any> {
        return { budget: [], technology: [], regulatory: [], timeline: [] };
    }

    private async generateRisks(extractions: Record<string, any[]>): Promise<any> {
        const risks = extractions.risk || [];
        return { risks: risks.map((r) => ({ description: r.content, likelihood: 'Medium', impact: 'Medium' })) };
    }

    private async generateSuccessMetrics(extractions: Record<string, any[]>): Promise<any> {
        return { metrics: ['User adoption rate > 80%', 'System uptime > 99%'] };
    }

    private async generateTimeline(extractions: Record<string, any[]>): Promise<any> {
        const timelines = extractions.timeline || [];
        return { milestones: timelines.map((t) => ({ phase: 'Phase 1', date: t.content })) };
    }

    private async generateGlossary(extractions: Record<string, any[]>): Promise<any> {
        return { terms: [] };
    }

    /**
     * Save BRD to database
     */
    private async saveBRD(projectId: string, sections: BRDSection) {
        // Convert all sections to JSON strings for SQLite
        const stringifiedSections = {
            executiveSummary: JSON.stringify(sections.executiveSummary),
            businessObjectives: JSON.stringify(sections.businessObjectives),
            stakeholderAnalysis: JSON.stringify(sections.stakeholderAnalysis),
            scope: JSON.stringify(sections.scope),
            functionalRequirements: JSON.stringify(sections.functionalRequirements),
            nonFunctionalRequirements: JSON.stringify(sections.nonFunctionalRequirements),
            assumptions: JSON.stringify(sections.assumptions),
            constraints: JSON.stringify(sections.constraints),
            risks: JSON.stringify(sections.risks),
            successMetrics: JSON.stringify(sections.successMetrics),
            timeline: JSON.stringify(sections.timeline),
            glossary: JSON.stringify(sections.glossary),
        };

        // Check if BRD already exists
        const existing = await prisma.bRD.findUnique({
            where: { projectId },
        });

        if (existing) {
            // Create version snapshot
            await prisma.bRDVersion.create({
                data: {
                    brdId: existing.id,
                    version: existing.version,
                    snapshot: JSON.stringify({
                        ...sections,
                        version: existing.version,
                    }),
                    editNote: 'Previous version before regeneration',
                },
            });

            // Update BRD
            return await prisma.bRD.update({
                where: { projectId },
                data: {
                    ...stringifiedSections,
                    version: existing.version + 1,
                },
            });
        } else {
            // Create new BRD
            return await prisma.bRD.create({
                data: {
                    projectId,
                    ...stringifiedSections,
                },
            });
        }
    }

    /**
     * Get BRD for a project
     */
    async getBRD(projectId: string) {
        const brd = await prisma.bRD.findUnique({
            where: { projectId },
            include: {
                project: {
                    select: {
                        name: true,
                        description: true,
                        status: true,
                    },
                },
            },
        });

        if (!brd) {
            return null;
        }

        // Parse all JSON string fields back to objects
        return {
            ...brd,
            executiveSummary: JSON.parse(brd.executiveSummary),
            businessObjectives: JSON.parse(brd.businessObjectives),
            stakeholderAnalysis: JSON.parse(brd.stakeholderAnalysis),
            scope: JSON.parse(brd.scope),
            functionalRequirements: JSON.parse(brd.functionalRequirements),
            nonFunctionalRequirements: JSON.parse(brd.nonFunctionalRequirements),
            assumptions: JSON.parse(brd.assumptions),
            constraints: JSON.parse(brd.constraints),
            risks: JSON.parse(brd.risks),
            successMetrics: JSON.parse(brd.successMetrics),
            timeline: JSON.parse(brd.timeline),
            glossary: JSON.parse(brd.glossary),
            rtm: brd.rtm ? JSON.parse(brd.rtm) : null,
        };
    }
}

// Export singleton instance
export const brdGeneratorService = new BRDGeneratorService();
