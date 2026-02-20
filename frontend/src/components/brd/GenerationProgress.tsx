import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface GenerationProgressProps {
    progress: Record<string, any>;
}

const SECTIONS = [
    { key: 'executive_summary', label: 'Executive Summary' },
    { key: 'business_objectives', label: 'Business Objectives' },
    { key: 'stakeholder_analysis', label: 'Stakeholder Analysis' },
    { key: 'scope', label: 'Scope' },
    { key: 'functional_requirements', label: 'Functional Requirements' },
    { key: 'nonfunctional_requirements', label: 'Non-Functional Requirements' },
    { key: 'assumptions', label: 'Assumptions' },
    { key: 'constraints', label: 'Constraints' },
    { key: 'risks', label: 'Risks' },
    { key: 'success_metrics', label: 'Success Metrics' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'glossary', label: 'Glossary' },
];

export default function GenerationProgress({ progress }: GenerationProgressProps) {
    const completedSections = Object.keys(progress).filter(
        (key) => progress[key]?.status !== 'generating'
    );
    const currentSection = Object.keys(progress).find(
        (key) => progress[key]?.status === 'generating'
    );

    const progressPercentage = (completedSections.length / SECTIONS.length) * 100;

    return (
        <div className="space-y-6">
            {/* Overall progress */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                        {completedSections.length} / {SECTIONS.length} sections
                    </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Section list */}
            <div className="space-y-2">
                {SECTIONS.map((section) => {
                    const isComplete = completedSections.includes(section.key);
                    const isCurrent = currentSection === section.key;

                    return (
                        <div
                            key={section.key}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${isCurrent ? 'bg-primary/5 border-primary' : ''
                                }`}
                        >
                            {isComplete ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : isCurrent ? (
                                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                            ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <div className={`text-sm font-medium ${isComplete ? 'text-muted-foreground' : ''}`}>
                                    {section.label}
                                </div>
                                {isCurrent && (
                                    <div className="text-xs text-muted-foreground mt-0.5">Generating...</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
