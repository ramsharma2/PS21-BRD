import { useState, useEffect } from 'react';
import type { BRD } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Target,
    Users,
    CheckSquare,
    Shield,
    AlertTriangle,
    TrendingUp,
    Calendar,
    BookOpen,
    ExternalLink,
    Loader2,
} from 'lucide-react';
import CitationBadge from './CitationBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/services/api';

interface BRDSectionsProps {
    brd: BRD;
}

interface CitationDetail {
    sourceId: string;
    chunkId: string;
    snippet: string;
    confidence: number;
    sourceMetadata?: any;
}

export default function BRDSections({ brd }: BRDSectionsProps) {
    const [selectedCitation, setSelectedCitation] = useState<any>(null);
    const [citationDialogOpen, setCitationDialogOpen] = useState(false);
    const [loadingCitation, setLoadingCitation] = useState(false);
    const [allExtractions, setAllExtractions] = useState<any[]>([]);
    const [citationMap, setCitationMap] = useState<Map<string, number>>(new Map());

    // Helper to safely render any value
    const renderValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    // Load all extractions on mount and build citation map
    useEffect(() => {
        const loadExtractions = async () => {
            try {
                const data = await api.getExtractions(brd.projectId);
                setAllExtractions(data || []);
                
                // Build a map of extraction ID to citation number
                const map = new Map<string, number>();
                const allCitationIds = new Set<string>();
                
                // Collect all citation IDs from the BRD
                const collectCitations = (obj: any) => {
                    if (!obj) return;
                    if (Array.isArray(obj)) {
                        obj.forEach(collectCitations);
                    } else if (typeof obj === 'object') {
                        if (obj.citations && Array.isArray(obj.citations)) {
                            obj.citations.forEach((id: string) => allCitationIds.add(id));
                        }
                        Object.values(obj).forEach(collectCitations);
                    }
                };
                
                collectCitations(brd);
                
                // Assign sequential numbers to citation IDs
                let citationNumber = 1;
                allCitationIds.forEach(id => {
                    map.set(id, citationNumber++);
                });
                
                setCitationMap(map);
            } catch (error) {
                console.error('Error loading extractions:', error);
            }
        };
        
        loadExtractions();
    }, [brd.projectId, brd]);

    // Handle citation click - show extraction details
    const handleCitationClick = async (citationId: string) => {
        setLoadingCitation(true);
        setCitationDialogOpen(true);
        
        try {
            // Find the extraction by ID
            const extraction = allExtractions.find(ext => ext.id === citationId);
            
            if (extraction) {
                // Parse citations if they exist
                let citations = [];
                try {
                    citations = typeof extraction.citations === 'string' 
                        ? JSON.parse(extraction.citations) 
                        : extraction.citations || [];
                } catch (e) {
                    console.error('Error parsing citations:', e);
                }

                // Get the first citation's source info
                const firstCitation = citations[0];
                let sourceInfo = null;
                
                if (firstCitation && firstCitation.sourceId) {
                    try {
                        sourceInfo = await api.getSource(firstCitation.sourceId);
                    } catch (error) {
                        console.error('Error fetching source:', error);
                    }
                }

                setSelectedCitation({
                    id: citationId,
                    content: extraction.content,
                    category: extraction.category,
                    priority: extraction.priority,
                    sourceInfo: sourceInfo,
                    snippet: firstCitation?.snippet || extraction.content,
                    confidence: firstCitation?.confidence || 1.0,
                });
            } else {
                console.error('Extraction not found for citation ID:', citationId);
                setSelectedCitation(null);
            }
        } catch (error) {
            console.error('Error fetching citation details:', error);
            setSelectedCitation(null);
        } finally {
            setLoadingCitation(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Executive Summary */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <CardTitle>1. Executive Summary</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {brd.executiveSummary.overview && (
                        <div>
                            <h4 className="font-medium mb-2">Overview</h4>
                            <p className="text-muted-foreground">{renderValue(brd.executiveSummary.overview)}</p>
                        </div>
                    )}
                    {brd.executiveSummary.scope && (
                        <div>
                            <h4 className="font-medium mb-2">Scope</h4>
                            <p className="text-muted-foreground">{renderValue(brd.executiveSummary.scope)}</p>
                        </div>
                    )}
                    {brd.executiveSummary.objectives?.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Key Objectives</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {brd.executiveSummary.objectives.map((obj, i) => (
                                    <li key={i}>{renderValue(obj)}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Business Objectives */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <CardTitle>2. Business Objectives</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {brd.businessObjectives.primary?.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Primary Objectives</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {brd.businessObjectives.primary.map((obj, i) => (
                                    <li key={i}>{renderValue(obj)}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {brd.businessObjectives.secondary?.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Secondary Objectives</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {brd.businessObjectives.secondary.map((obj, i) => (
                                    <li key={i}>{renderValue(obj)}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {brd.businessObjectives.strategicAlignment && (
                        <div>
                            <h4 className="font-medium mb-2">Strategic Alignment</h4>
                            <p className="text-muted-foreground">{renderValue(brd.businessObjectives.strategicAlignment)}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stakeholder Analysis */}
            {brd.stakeholderAnalysis?.stakeholders?.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <CardTitle>3. Stakeholder Analysis</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {brd.stakeholderAnalysis.stakeholders.map((stakeholder, i) => (
                                <div key={i} className="border-l-4 border-primary pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{renderValue(stakeholder.name)}</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                            {renderValue(stakeholder.role)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div>Interest Level: {renderValue(stakeholder.interest)}</div>
                                        {stakeholder.concerns?.length > 0 && (
                                            <div>
                                                Concerns: {stakeholder.concerns.map(c => renderValue(c)).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Scope */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        <CardTitle>4. Scope</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-2 text-green-600">In Scope</h4>
                            {brd.scope.inScope?.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {brd.scope.inScope.map((item, i) => (
                                        <li key={i}>{renderValue(item)}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-sm">No items defined</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 text-red-600">Out of Scope</h4>
                            {brd.scope.outOfScope?.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {brd.scope.outOfScope.map((item, i) => (
                                        <li key={i}>{renderValue(item)}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-sm">No items defined</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
                <CardHeader>
                    <CardTitle>5. Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="functional">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="functional">Functional</TabsTrigger>
                            <TabsTrigger value="nonfunctional">Non-Functional</TabsTrigger>
                        </TabsList>

                        <TabsContent value="functional" className="mt-4">
                            {brd.functionalRequirements?.requirements?.length > 0 ? (
                                <div className="space-y-4">
                                    {brd.functionalRequirements.requirements.map((req) => (
                                        <div key={req.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="font-medium">
                                                    {req.id}: {req.description}
                                                    {req.citations?.length > 0 && (
                                                        <span className="inline-flex gap-1 ml-2">
                                                            {req.citations.map((citId) => {
                                                                const citNum = citationMap.get(citId);
                                                                return citNum ? (
                                                                    <CitationBadge
                                                                        key={citId}
                                                                        citationNumber={citNum}
                                                                        onClick={() => handleCitationClick(citId)}
                                                                    />
                                                                ) : null;
                                                            })}
                                                        </span>
                                                    )}
                                                </h4>
                                                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getPriorityColor(req.priority)}`}>
                                                    {req.priority.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {req.acceptanceCriteria?.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-medium mb-1">Acceptance Criteria:</div>
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                        {req.acceptanceCriteria.map((ac, i) => (
                                                            <li key={i}>{typeof ac === 'string' ? ac : JSON.stringify(ac)}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No functional requirements extracted</p>
                            )}
                        </TabsContent>

                        <TabsContent value="nonfunctional" className="mt-4">
                            <div className="space-y-4">
                                {brd.nonFunctionalRequirements?.performance?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Performance</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {brd.nonFunctionalRequirements.performance.map((item, i) => (
                                                <li key={i}>
                                                    {typeof item === 'object' && item.description ? (
                                                        <>
                                                            <span className="font-medium">{item.id}:</span> {item.description}
                                                            {item.priority && (
                                                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                    {item.priority}
                                                                </span>
                                                            )}
                                                            {item.citations?.length > 0 && (
                                                                <span className="inline-flex gap-1 ml-2">
                                                                    {item.citations.map((citId: string) => {
                                                                        const citNum = citationMap.get(citId);
                                                                        return citNum ? (
                                                                            <CitationBadge
                                                                                key={citId}
                                                                                citationNumber={citNum}
                                                                                onClick={() => handleCitationClick(citId)}
                                                                            />
                                                                        ) : null;
                                                                    })}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        renderValue(item)
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {brd.nonFunctionalRequirements?.security?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Security</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {brd.nonFunctionalRequirements.security.map((item, i) => (
                                                <li key={i}>
                                                    {typeof item === 'object' && item.description ? (
                                                        <>
                                                            <span className="font-medium">{item.id}:</span> {item.description}
                                                            {item.priority && (
                                                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                    {item.priority}
                                                                </span>
                                                            )}
                                                            {item.citations?.length > 0 && (
                                                                <span className="inline-flex gap-1 ml-2">
                                                                    {item.citations.map((citId: string) => {
                                                                        const citNum = citationMap.get(citId);
                                                                        return citNum ? (
                                                                            <CitationBadge
                                                                                key={citId}
                                                                                citationNumber={citNum}
                                                                                onClick={() => handleCitationClick(citId)}
                                                                            />
                                                                        ) : null;
                                                                    })}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        renderValue(item)
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {brd.nonFunctionalRequirements?.scalability?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Scalability</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {brd.nonFunctionalRequirements.scalability.map((item, i) => (
                                                <li key={i}>
                                                    {typeof item === 'object' && item.description ? (
                                                        <>
                                                            <span className="font-medium">{item.id}:</span> {item.description}
                                                            {item.priority && (
                                                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                    {item.priority}
                                                                </span>
                                                            )}
                                                            {item.citations?.length > 0 && (
                                                                <span className="inline-flex gap-1 ml-2">
                                                                    {item.citations.map((citId: string) => {
                                                                        const citNum = citationMap.get(citId);
                                                                        return citNum ? (
                                                                            <CitationBadge
                                                                                key={citId}
                                                                                citationNumber={citNum}
                                                                                onClick={() => handleCitationClick(citId)}
                                                                            />
                                                                        ) : null;
                                                                    })}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        renderValue(item)
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {brd.nonFunctionalRequirements?.reliability?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Reliability</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {brd.nonFunctionalRequirements.reliability.map((item, i) => (
                                                <li key={i}>
                                                    {typeof item === 'object' && item.description ? (
                                                        <>
                                                            <span className="font-medium">{item.id}:</span> {item.description}
                                                            {item.priority && (
                                                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                    {item.priority}
                                                                </span>
                                                            )}
                                                            {item.citations?.length > 0 && (
                                                                <span className="inline-flex gap-1 ml-2">
                                                                    {item.citations.map((citId: string) => {
                                                                        const citNum = citationMap.get(citId);
                                                                        return citNum ? (
                                                                            <CitationBadge
                                                                                key={citId}
                                                                                citationNumber={citNum}
                                                                                onClick={() => handleCitationClick(citId)}
                                                                            />
                                                                        ) : null;
                                                                    })}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        renderValue(item)
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Risks */}
            {brd.risks?.risks?.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            <CardTitle>6. Risks & Mitigation</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {brd.risks.risks.map((risk, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm">{renderValue(risk.description)}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>Likelihood: {renderValue(risk.likelihood)}</span>
                                            <span>Impact: {renderValue(risk.impact)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Success Metrics */}
            {brd.successMetrics?.metrics?.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            <CardTitle>7. Success Metrics</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            {brd.successMetrics.metrics.map((metric, i) => (
                                <li key={i}>{renderValue(metric)}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Timeline */}
            {brd.timeline?.milestones?.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <CardTitle>8. Timeline & Milestones</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {brd.timeline.milestones.map((milestone, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="font-medium">{renderValue(milestone.phase)}</div>
                                        <div className="text-sm text-muted-foreground">{renderValue(milestone.date)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Citation Detail Dialog */}
            <Dialog open={citationDialogOpen} onOpenChange={setCitationDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Source Citation
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            View the original source document that supports this requirement
                        </p>
                    </DialogHeader>
                    
                    {loadingCitation ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            Loading citation details...
                        </div>
                    ) : selectedCitation ? (
                        <div className="space-y-4">
                            {/* Source Document Information */}
                            {selectedCitation.sourceInfo && (
                                <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-primary mb-1">
                                                📄 Source Document
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                {selectedCitation.sourceInfo.metadata && (() => {
                                                    try {
                                                        const metadata = typeof selectedCitation.sourceInfo.metadata === 'string'
                                                            ? JSON.parse(selectedCitation.sourceInfo.metadata)
                                                            : selectedCitation.sourceInfo.metadata;
                                                        return (
                                                            <>
                                                                {metadata.filename && (
                                                                    <div className="font-medium text-base">
                                                                        {metadata.filename}
                                                                    </div>
                                                                )}
                                                                {metadata.subject && (
                                                                    <div className="text-muted-foreground">
                                                                        <span className="font-medium">Subject:</span> {metadata.subject}
                                                                    </div>
                                                                )}
                                                                {metadata.author && (
                                                                    <div className="text-muted-foreground">
                                                                        <span className="font-medium">Author:</span> {metadata.author}
                                                                    </div>
                                                                )}
                                                                {metadata.date && (
                                                                    <div className="text-muted-foreground">
                                                                        <span className="font-medium">Date:</span> {new Date(metadata.date).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    } catch (e) {
                                                        return null;
                                                    }
                                                })()}
                                                <div className="text-muted-foreground">
                                                    <span className="font-medium">Type:</span>{' '}
                                                    <span className="capitalize">{selectedCitation.sourceInfo.sourceType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedCitation.sourceInfo.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // Open source in new tab or download
                                                    window.open(`/api/sources/${selectedCitation.sourceInfo.id}/download`, '_blank');
                                                }}
                                                className="flex-shrink-0"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View Document
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Original Text from Source */}
                            <div>
                                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <span>📝 Original Text from Source</span>
                                    <Badge variant="secondary" className="text-xs">
                                        Exact Quote
                                    </Badge>
                                </div>
                                <div className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r-lg">
                                    <p className="text-sm text-foreground italic leading-relaxed">
                                        "{selectedCitation.snippet || selectedCitation.content}"
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This is the exact text extracted from the source document that supports this requirement.
                                </p>
                            </div>

                            {/* Extracted Requirement */}
                            <div>
                                <div className="text-sm font-medium mb-2">🎯 Extracted Requirement</div>
                                <div className="border rounded-lg p-4 bg-background">
                                    <p className="text-sm text-foreground">
                                        {selectedCitation.content}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="border rounded-lg p-4 bg-muted/50">
                                <div className="text-sm font-medium mb-2">ℹ️ Extraction Details</div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium block text-muted-foreground">Category</span>
                                        <span className="capitalize">
                                            {selectedCitation.category?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {selectedCitation.priority && (
                                        <div>
                                            <span className="font-medium block text-muted-foreground">Priority</span>
                                            <span className="capitalize">{selectedCitation.priority}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium block text-muted-foreground">Confidence</span>
                                        <span>{(selectedCitation.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Traceability Link */}
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-blue-600 dark:text-blue-400">🔗</span>
                                    <span className="text-blue-900 dark:text-blue-100">
                                        View full traceability matrix
                                    </span>
                                </div>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => {
                                        window.location.href = `/traceability/${brd.projectId}`;
                                    }}
                                    className="text-blue-600 dark:text-blue-400"
                                >
                                    Go to RTM →
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No citation information available</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Citation details not found</p>
                            <p className="text-xs mt-2">This requirement may not have source tracking information.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        must_have: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        should_have: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        could_have: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        wont_have: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[priority] || colors.could_have;
}
