import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import type { ProjectStats } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Template {
    id: string;
    name: string;
    description: string;
    icon: string;
    sectionCount: number;
}

const TEMPLATES: Template[] = [
    {
        id: 'standard',
        name: 'Standard BRD',
        description: 'Comprehensive 12-section document',
        icon: '📄',
        sectionCount: 12,
    },
    {
        id: 'agile',
        name: 'Agile/Lean BRD',
        description: 'Lightweight 7-section template',
        icon: '⚡',
        sectionCount: 7,
    },
    {
        id: 'technical',
        name: 'Technical BRD',
        description: 'Technical 10-section specs',
        icon: '⚙️',
        sectionCount: 10,
    },
    {
        id: 'minimal',
        name: 'Minimal BRD',
        description: 'Quick 5-section overview',
        icon: '📋',
        sectionCount: 5,
    },
];

interface ProcessingPanelProps {
    projectId: string;
    sourceCount: number;
    onProcessingComplete?: () => void;
}

export default function ProcessingPanel({
    projectId,
    sourceCount,
    onProcessingComplete,
}: ProcessingPanelProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const processMutation = useMutation({
        mutationFn: () => api.processProject(projectId),
        onMutate: () => {
            setIsProcessing(true);
            setStats(null);
        },
        onSuccess: (data) => {
            setStats(data);
            setIsProcessing(false);
            onProcessingComplete?.();
        },
        onError: () => {
            setIsProcessing(false);
        },
    });

    const handleProcess = () => {
        processMutation.mutate();
    };

    const handleGenerateBRD = () => {
        setShowTemplateDialog(true);
    };

    const handleConfirmGenerate = async () => {
        setShowTemplateDialog(false);
        setIsGenerating(true);
        try {
            await api.generateBRD(projectId, selectedTemplate);
            toast({
                title: 'Success',
                description: 'BRD generated successfully!',
            });
            // Wait a bit before navigating to ensure backend has updated
            setTimeout(() => {
                navigate(`/projects/${projectId}/brd`);
            }, 500);
        } catch (error: any) {
            console.error('BRD Generation Error:', error);
            toast({
                title: 'Error',
                description: error?.message || 'Failed to generate BRD. Please try again.',
                variant: 'destructive',
            });
            setIsGenerating(false);
        }
    };

    const handleCancelTemplate = () => {
        setShowTemplateDialog(false);
    };

    if (isGenerating) {
        return (
            <Card className="border-primary/50">
                <CardContent className="pt-6">
                    <div className="text-center space-y-6 py-12">
                        <div className="relative inline-block">
                            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="font-bold text-xl">Generating Your BRD...</div>
                            <div className="text-sm text-muted-foreground max-w-md mx-auto">
                                AI is analyzing your requirements and creating a professional {' '}
                                <span className="font-semibold text-foreground">
                                    {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Processing</CardTitle>
                <CardDescription>
                    Filter noise and extract key requirements from your sources
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Process button */}
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleProcess}
                        disabled={sourceCount === 0 || isProcessing}
                        className="flex-1"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Start Processing
                            </>
                        )}
                    </Button>
                </div>

                {sourceCount === 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Add at least one data source to start processing</span>
                    </div>
                )}

                {/* Processing status */}
                {isProcessing && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="font-medium">Processing {sourceCount} sources...</span>
                        </div>
                        <Progress value={50} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                            This may take a few minutes depending on the amount of data
                        </div>
                    </div>
                )}

                {/* Results */}
                {stats && !isProcessing && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">Processing complete!</span>
                        </div>

                        {/* Noise filtering stats */}
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Noise Filtering</div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="bg-muted p-3 rounded-lg">
                                    <div className="text-2xl font-bold">{stats.filtering.total}</div>
                                    <div className="text-xs text-muted-foreground">Total Chunks</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.filtering.relevant}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Relevant</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{stats.filtering.noise}</div>
                                    <div className="text-xs text-muted-foreground">Filtered Out</div>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {stats.filtering.relevancePercentage.toFixed(1)}% of content is relevant
                            </div>
                        </div>

                        {/* Extraction stats */}
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Information Extracted</div>
                            <div className="space-y-2">
                                {Object.entries(stats.extraction.byCategory).map(([category, count]) => (
                                    <div key={category} className="flex items-center justify-between text-sm">
                                        <span className="capitalize text-muted-foreground">
                                            {category.replace('_', ' ')}
                                        </span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 border-t">
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span>Total Extractions</span>
                                    <span className="text-primary">{stats.extraction.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Generate BRD Button */}
                        <div className="pt-4 border-t">
                            <Button 
                                onClick={handleGenerateBRD} 
                                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                                size="lg"
                            >
                                <FileText className="h-5 w-5 mr-2" />
                                Generate BRD Document
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-3">
                                Choose from 4 professional templates
                            </p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {processMutation.isError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Error: {(processMutation.error as Error).message}</span>
                    </div>
                )}
            </CardContent>

            {/* Template Selection Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Choose Your BRD Template</DialogTitle>
                        <DialogDescription className="text-base">
                            Select the template that best matches your project type and documentation needs
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                        {TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={`group relative p-6 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-xl hover:scale-[1.02] ${
                                    selectedTemplate === template.id
                                        ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20'
                                        : 'border-border hover:border-primary/50 bg-card'
                                }`}
                            >
                                {/* Selection indicator */}
                                {selectedTemplate === template.id && (
                                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                )}

                                {/* Icon and Title */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="text-5xl group-hover:scale-110 transition-transform duration-200">
                                        {template.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {template.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Section count badge */}
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                                        selectedTemplate === template.id
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                    }`}>
                                        <FileText className="h-3.5 w-3.5" />
                                        {template.sectionCount} sections
                                    </div>
                                    {selectedTemplate === template.id && (
                                        <span className="text-xs font-medium text-primary ml-auto">
                                            Selected ✓
                                        </span>
                                    )}
                                </div>

                                {/* Hover effect overlay */}
                                <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none ${
                                    selectedTemplate === template.id
                                        ? 'opacity-0'
                                        : 'opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-transparent'
                                }`} />
                            </button>
                        ))}
                    </div>

                    {/* Info box */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">💡</div>
                            <div className="flex-1 text-sm">
                                <p className="font-medium mb-1">Not sure which template to choose?</p>
                                <p className="text-muted-foreground">
                                    Start with <span className="font-semibold text-foreground">Standard BRD</span> for comprehensive documentation, 
                                    or <span className="font-semibold text-foreground">Agile/Lean</span> for faster, iterative projects.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Selected: <span className="font-semibold text-foreground">
                                {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleCancelTemplate} size="lg">
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmGenerate} size="lg" className="min-w-[160px]">
                                <FileText className="h-4 w-4 mr-2" />
                                Generate BRD
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
