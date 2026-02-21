/**
 * BRD Template Definitions
 * Different templates for different project types
 */

export interface BRDTemplate {
    id: string;
    name: string;
    description: string;
    sections: string[];
    icon: string;
}

export const BRD_TEMPLATES: BRDTemplate[] = [
    {
        id: 'standard',
        name: 'Standard BRD',
        description: 'Comprehensive 12-section document suitable for most projects',
        icon: '📄',
        sections: [
            'executiveSummary',
            'businessObjectives',
            'stakeholderAnalysis',
            'scope',
            'functionalRequirements',
            'nonFunctionalRequirements',
            'assumptions',
            'constraints',
            'risks',
            'successMetrics',
            'timeline',
            'glossary',
        ],
    },
    {
        id: 'agile',
        name: 'Agile/Lean BRD',
        description: 'Lightweight template focused on user stories and acceptance criteria',
        icon: '⚡',
        sections: [
            'executiveSummary',
            'businessObjectives',
            'stakeholderAnalysis',
            'functionalRequirements',
            'nonFunctionalRequirements',
            'successMetrics',
            'timeline',
        ],
    },
    {
        id: 'technical',
        name: 'Technical BRD',
        description: 'Detailed technical specifications for complex systems',
        icon: '⚙️',
        sections: [
            'executiveSummary',
            'businessObjectives',
            'scope',
            'functionalRequirements',
            'nonFunctionalRequirements',
            'assumptions',
            'constraints',
            'risks',
            'timeline',
            'glossary',
        ],
    },
    {
        id: 'minimal',
        name: 'Minimal BRD',
        description: 'Quick overview for small projects or proof of concepts',
        icon: '📋',
        sections: [
            'executiveSummary',
            'businessObjectives',
            'functionalRequirements',
            'nonFunctionalRequirements',
            'timeline',
        ],
    },
];

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): BRDTemplate | undefined {
    return BRD_TEMPLATES.find((t) => t.id === templateId);
}

/**
 * Get section names for a template
 */
export function getTemplateSections(templateId: string): string[] {
    const template = getTemplateById(templateId);
    return template ? template.sections : BRD_TEMPLATES[0].sections;
}

/**
 * Check if a section should be generated for a template
 */
export function shouldGenerateSection(templateId: string, sectionName: string): boolean {
    const sections = getTemplateSections(templateId);
    return sections.includes(sectionName);
}
