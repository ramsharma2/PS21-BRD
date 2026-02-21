import type { BRD } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';

interface BRDSectionsProps {
    brd: BRD;
}

export default function BRDSections({ brd }: BRDSectionsProps) {
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
                            <p className="text-muted-foreground">{brd.executiveSummary.overview}</p>
                        </div>
                    )}
                    {brd.executiveSummary.scope && (
                        <div>
                            <h4 className="font-medium mb-2">Scope</h4>
                            <p className="text-muted-foreground">{brd.executiveSummary.scope}</p>
                        </div>
                    )}
                    {brd.executiveSummary.objectives?.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Key Objectives</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {brd.executiveSummary.objectives.map((obj, i) => (
                                    <li key={i}>{obj}</li>
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
                                    <li key={i}>{obj}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {brd.businessObjectives.secondary?.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Secondary Objectives</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {brd.businessObjectives.secondary.map((obj, i) => (
                                    <li key={i}>{obj}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {brd.businessObjectives.strategicAlignment && (
                        <div>
                            <h4 className="font-medium mb-2">Strategic Alignment</h4>
                            <p className="text-muted-foreground">{brd.businessObjectives.strategicAlignment}</p>
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
                                        <h4 className="font-medium">{stakeholder.name}</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                            {stakeholder.role}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div>Interest Level: {stakeholder.interest}</div>
                                        {stakeholder.concerns?.length > 0 && (
                                            <div>
                                                Concerns: {stakeholder.concerns.join(', ')}
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
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {brd.scope.inScope?.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 text-red-600">Out of Scope</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {brd.scope.outOfScope?.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
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
                                                <h4 className="font-medium">{req.id}: {req.description}</h4>
                                                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getPriorityColor(req.priority)}`}>
                                                    {req.priority.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {req.acceptanceCriteria?.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-medium mb-1">Acceptance Criteria:</div>
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                        {req.acceptanceCriteria.map((ac, i) => (
                                                            <li key={i}>{ac}</li>
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
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {brd.nonFunctionalRequirements?.security?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Security</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {brd.nonFunctionalRequirements.security.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {brd.nonFunctionalRequirements?.scalability?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Scalability</h4>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            {brd.nonFunctionalRequirements.scalability.map((item, i) => (
                                                <li key={i}>{item}</li>
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
                                        <p className="text-sm">{risk.description}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>Likelihood: {risk.likelihood}</span>
                                            <span>Impact: {risk.impact}</span>
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
                                <li key={i}>{metric}</li>
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
                                        <div className="font-medium">{milestone.phase}</div>
                                        <div className="text-sm text-muted-foreground">{milestone.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
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
