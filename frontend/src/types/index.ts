// ============================================
// PROJECT TYPES
// ============================================

export interface Project {
    id: string;
    name: string;
    description?: string;
    userId: string;
    status: 'draft' | 'ingesting' | 'processing' | 'ready' | 'error';
    createdAt: string;
    updatedAt: string;
    _count?: {
        sources: number;
        extractions: number;
        conflicts: number;
    };
    brd?: {
        id: string;
        version: number;
        updatedAt: string;
    };
}

export interface CreateProjectInput {
    name: string;
    description?: string;
}

export interface UpdateProjectInput {
    name?: string;
    description?: string;
    status?: Project['status'];
}

// ============================================
// SOURCE TYPES
// ============================================

export interface Source {
    id: string;
    projectId: string;
    sourceType: 'email' | 'slack' | 'transcript' | 'document' | 'manual';
    sourceId?: string;
    rawContent: string;
    metadata: Record<string, any>;
    ingestedAt: string;
}

export interface UploadSourceInput {
    projectId: string;
    file: File;
    sourceLabel?: string;
}

export interface ManualTextInput {
    projectId: string;
    content: string;
    sourceLabel?: string;
    metadata?: Record<string, any>;
}

// ============================================
// EXTRACTION TYPES
// ============================================

export interface Extraction {
    id: string;
    projectId: string;
    category: 'functional_req' | 'nonfunctional_req' | 'objective' | 'stakeholder' | 'decision' | 'assumption' | 'timeline' | 'risk';
    content: string;
    priority?: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
    citations: Citation[];
    metadata?: Record<string, any>;
    createdAt: string;
}

export interface Citation {
    sourceId: string;
    chunkId?: string;
    snippet: string;
    confidence: number;
}

// ============================================
// BRD TYPES
// ============================================

export interface BRD {
    id: string;
    projectId: string;
    version: number;
    executiveSummary: ExecutiveSummary;
    businessObjectives: BusinessObjectives;
    stakeholderAnalysis: StakeholderAnalysis;
    scope: Scope;
    functionalRequirements: FunctionalRequirements;
    nonFunctionalRequirements: NonFunctionalRequirements;
    assumptions: Assumptions;
    constraints: Constraints;
    risks: Risks;
    successMetrics: SuccessMetrics;
    timeline: Timeline;
    glossary: Glossary;
    rtm?: RTM;
    createdAt: string;
    updatedAt: string;
    project?: {
        name: string;
        description?: string;
        status: string;
    };
}

export interface ExecutiveSummary {
    overview: string;
    scope: string;
    objectives: string[];
    stakeholders: string[];
    timeline?: string;
}

export interface BusinessObjectives {
    primary: string[];
    secondary: string[];
    strategicAlignment: string;
}

export interface StakeholderAnalysis {
    stakeholders: Stakeholder[];
}

export interface Stakeholder {
    name: string;
    role: string;
    interest: 'High' | 'Medium' | 'Low';
    concerns: string[];
    communicationPreference: string;
}

export interface Scope {
    inScope: string[];
    outOfScope: string[];
}

export interface FunctionalRequirements {
    requirements: Requirement[];
}

export interface Requirement {
    id: string;
    description: string;
    priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
    acceptanceCriteria: string[];
    citations: number[];
}

export interface NonFunctionalRequirements {
    performance: string[];
    security: string[];
    scalability: string[];
    reliability: string[];
}

export interface Assumptions {
    assumptions: string[];
}

export interface Constraints {
    budget: string[];
    technology: string[];
    regulatory: string[];
    timeline: string[];
}

export interface Risks {
    risks: Risk[];
}

export interface Risk {
    description: string;
    likelihood: 'High' | 'Medium' | 'Low';
    impact: 'High' | 'Medium' | 'Low';
}

export interface SuccessMetrics {
    metrics: string[];
}

export interface Timeline {
    milestones: Milestone[];
}

export interface Milestone {
    phase: string;
    date: string;
}

export interface Glossary {
    terms: GlossaryTerm[];
}

export interface GlossaryTerm {
    term: string;
    definition: string;
}

export interface RTM {
    requirements: RTMRequirement[];
}

export interface RTMRequirement {
    id: string;
    description: string;
    source: string;
    stakeholder: string;
    priority: string;
    status: string;
    testCase?: string;
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface ProjectStats {
    filtering: {
        total: number;
        relevant: number;
        noise: number;
        relevancePercentage: number;
    };
    extraction: {
        total: number;
        byCategory: Record<string, number>;
    };
    sources: number;
    conflicts: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ProcessingProgress {
    section: string;
    content: any;
}

// ============================================
// EDIT & VERSIONING TYPES
// ============================================

export interface EditRequest {
    projectId: string;
    brdId: string;
    instruction: string;
    section?: string;
}

export interface EditResult {
    success: boolean;
    newContent: any;
    explanation: string;
    affectedSections: string[];
}

export interface BRDVersion {
    id: string;
    versionNumber: number;
    createdAt: string;
    changeLog: string;
    createdBy: string;
}

export interface Conflict {
    id: string;
    projectId: string;
    itemAId: string;
    itemBId: string;
    itemA?: Extraction;
    itemB?: Extraction;
    severity: 'high' | 'medium' | 'low';
    description: string;
    status: 'open' | 'resolved' | 'ignored';
    resolution?: string;
    createdAt: string;
    resolvedAt?: string;
}

export interface ConflictCheckResponse {
    success: boolean;
    count: number;
    conflicts: ConflictCheckResult[];
}

interface ConflictCheckResult {
    itemAId: string;
    itemBId: string;
    hasConflict: boolean;
    severity?: 'high' | 'medium' | 'low';
    description?: string;
    suggestedResolution?: string;
}

export interface RTMEntry {
    requirementId: string;
    requirement: string;
    sourceId: string;
    sourceName: string;
    brdSection: string;
    priority: string;
    status: string;
}

export interface SentimentAnalysisResult {
    overallScore: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    breakdown: {
        functional: number;
        nonFunctional: number;
        constraints: number;
    };
    stakeholderConcerns: string[];
    suggestions: string[];
}
