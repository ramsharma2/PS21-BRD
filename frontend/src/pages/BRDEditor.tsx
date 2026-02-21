import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BRDSections from '@/components/brd/BRDSections';
import GenerationProgress from '@/components/brd/GenerationProgress';
import NLEditBar from '@/components/brd/NLEditBar';
import VersionHistory from '@/components/brd/VersionHistory';
import WebSearchPanel from '@/components/brd/WebSearchPanel';
import { ArrowLeft, Download, Sparkles, FileText, Loader2, History, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToPDF, exportToDOCX, exportToMarkdown } from '@/services/exportService';
import type { BRDVersion } from '@/types';

// Helper function to transform BRD data for export
function transformBRDForExport(brd: any) {
    if (!brd) return [];

    const formatObject = (obj: any): string => {
        let result = '';
        for (const [key, value] of Object.entries(obj)) {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

            if (Array.isArray(value)) {
                result += `${label}:\n${value.map((item) => `  • ${typeof item === 'object' ? JSON.stringify(item) : item}`).join('\n')}\n\n`;
            } else if (typeof value === 'object' && value !== null) {
                result += `${label}:\n${formatObject(value)}\n`;
            } else {
                result += `${label}: ${value}\n`;
            }
        }
        return result;
    };

    const formatContent = (data: any): string => {
        if (!data) return '(No content)';
        if (typeof data === 'string') return data;

        // Handle arrays
        if (Array.isArray(data)) {
            return data.map((item, i) => `${i + 1}. ${typeof item === 'object' ? formatObject(item) : item}`).join('\n');
        }

        // Handle objects
        if (typeof data === 'object') {
            return formatObject(data);
        }

        return String(data);
    };

    return [
        { title: 'Executive Summary', content: formatContent(brd.executiveSummary) },
        { title: 'Business Objectives', content: formatContent(brd.businessObjectives) },
        { title: 'Stakeholder Analysis', content: formatContent(brd.stakeholderAnalysis) },
        { title: 'Scope', content: formatContent(brd.scope) },
        { title: 'Functional Requirements', content: formatContent(brd.functionalRequirements) },
        { title: 'Non-Functional Requirements', content: formatContent(brd.nonFunctionalRequirements) },
        { title: 'Assumptions & Dependencies', content: formatContent(brd.assumptions) },
        { title: 'Constraints', content: formatContent(brd.constraints) },
        { title: 'Risks & Open Questions', content: formatContent(brd.risks) },
        { title: 'Success Metrics', content: formatContent(brd.successMetrics) },
        { title: 'Timeline & Milestones', content: formatContent(brd.timeline) },
        { title: 'Glossary', content: formatContent(brd.glossary) },
    ];
}

export default function BRDEditor() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, setCurrentProject } = useProjectStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<Record<string, any>>({});
    const [shareUrlCopied, setShareUrlCopied] = useState(false);
    const { toast } = useToast();

    // Fetch project
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => api.getProject(projectId!),
        enabled: !!projectId,
    });

    // Fetch BRD
    const { data: brd, refetch: refetchBRD } = useQuery({
        queryKey: ['brd', projectId],
        queryFn: () => api.getBRD(projectId!),
        enabled: !!projectId,
        retry: false, // Don't retry on 404
        refetchInterval: (data) => {
            // Only poll if BRD exists, otherwise stop polling
            return data ? 3000 : false;
        },
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ['stats', projectId],
        queryFn: () => api.getProjectStats(projectId!),
        enabled: !!projectId,
    });

    // Fetch history
    const { data: history, refetch: refetchHistory } = useQuery({
        queryKey: ['brd', 'history', brd?.id],
        queryFn: () => api.getVersionHistory(brd!.id),
        enabled: !!brd?.id,
    });

    // Update current project when it changes
    useEffect(() => {
        if (project && (!currentProject || currentProject.id !== project.id)) {
            setCurrentProject(project);
        }
    }, [project, currentProject, setCurrentProject]);

    // Generate BRD mutation
    const generateMutation = useMutation({
        mutationFn: () => api.generateBRD(projectId!),
        onSuccess: () => {
            refetchBRD();
            setIsGenerating(false);
        },
        onError: () => {
            setIsGenerating(false);
        },
    });

    // Export mutation
    const exportMutation = useMutation({
        mutationFn: (format: 'json' | 'md') => api.exportBRD(projectId!, format),
        onSuccess: (blob, format) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `BRD-${project?.name || 'document'}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
    });

    // Edit mutation
    const editMutation = useMutation({
        mutationFn: (instruction: string) =>
            api.applyEdit({
                projectId: projectId!,
                brdId: brd!.id,
                instruction
            }),
        onSuccess: (data) => {
            refetchBRD();
            refetchHistory();
            toast({
                title: "Edit Applied",
                description: data.explanation,
            });
        },
        onError: () => {
            toast({
                title: "Edit Failed",
                description: "Failed to apply edit. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Rollback mutation
    const rollbackMutation = useMutation({
        mutationFn: (version: BRDVersion) =>
            api.rollbackToVersion(brd!.id, version.id),
        onSuccess: () => {
            refetchBRD();
            refetchHistory();
            toast({
                title: "Rollback Successful",
                description: "BRD reverted to selected version.",
            });
        },
    });

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerationProgress({});
        try {
            // Always run process step first — it's idempotent and required before generateBRD
            // (noise filtering + extraction must happen before BRD generation)
            if (!stats || stats.extraction.total === 0) {
                await api.processProject(projectId!);
            }
            generateMutation.mutate();
        } catch (err: any) {
            setIsGenerating(false);
            toast({
                title: 'Processing Failed',
                description: err?.message || 'Failed to process sources before generating BRD.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = async (instruction: string) => {
        await editMutation.mutateAsync(instruction);
    };

    const handleRollback = (version: BRDVersion) => {
        if (confirm(`Are you sure you want to rollback to version ${version.versionNumber}?`)) {
            rollbackMutation.mutate(version);
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/projects/${projectId}/brd`;
        navigator.clipboard.writeText(shareUrl);
        setShareUrlCopied(true);
        toast({
            title: "Link Copied",
            description: "BRD link copied to clipboard",
        });
        setTimeout(() => setShareUrlCopied(false), 2000);
    };

    const handleDownload = async (format: 'pdf' | 'docx' | 'md') => {
        try {
            const sections = transformBRDForExport(brd);
            switch (format) {
                case 'pdf':
                    await exportToPDF(project!, sections);
                    break;
                case 'docx':
                    await exportToDOCX(project!, sections);
                    break;
                case 'md':
                    await exportToMarkdown(project!, sections);
                    break;
            }
            toast({
                title: "Download Started",
                description: `BRD is being downloaded as ${format.toUpperCase()}`,
            });
        } catch (error) {
            toast({
                title: "Download Failed",
                description: "Failed to download BRD. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (!projectId) {
        return <div>Project not found</div>;
    }

    const hasExtractions = stats && stats.extraction.total > 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/ingest`)} className="mb-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Data Ingestion
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">BRD Editor</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-muted-foreground">{project?.name || 'Loading...'}</p>
                        {brd && <span className="text-sm bg-muted px-2 py-0.5 rounded-full text-muted-foreground">v{brd.version}</span>}
                    </div>
                </div>

                {brd && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleShare}>
                            {shareUrlCopied ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                </>
                            )}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                                    Download as PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload('docx')}>
                                    Download as Word (DOCX)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload('md')}>
                                    Download as Markdown
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline">
                                    <History className="h-4 w-4 mr-2" />
                                    History
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Version History</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <VersionHistory
                                        versions={history || []}
                                        currentVersion={brd.version}
                                        onRollback={handleRollback}
                                        isRollingBack={rollbackMutation.isPending}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Sources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sources}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Relevant Chunks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.filtering.relevant}</div>
                            <div className="text-xs text-muted-foreground">
                                {stats.filtering.relevancePercentage.toFixed(1)}% of total
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Extractions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.extraction.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">BRD Version</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{brd?.version || '-'}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main content */}
            {!brd && !isGenerating && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No BRD Generated Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            {hasExtractions
                                ? 'Generate a professional Business Requirements Document from your extracted information'
                                : 'Process your data sources first to extract requirements before generating a BRD'}
                        </p>
                        {hasExtractions ? (
                            <Button onClick={handleGenerate} size="lg">
                                <Sparkles className="h-5 w-5 mr-2" />
                                Generate BRD
                            </Button>
                        ) : (
                            <Button onClick={() => navigate(`/projects/${projectId}/ingest`)} size="lg">
                                Go to Data Ingestion
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Generation in progress */}
            {isGenerating && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Generating BRD...
                        </CardTitle>
                        <CardDescription>
                            AI is synthesizing your requirements into a structured document
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GenerationProgress progress={generationProgress} />
                    </CardContent>
                </Card>
            )}

            {/* BRD Display & Edit */}
            {brd && !isGenerating && (
                <>
                    <NLEditBar
                        onEdit={handleEdit}
                        isProcessing={editMutation.isPending}
                    />
                    
                    {/* Web Search Panel */}
                    <WebSearchPanel 
                        projectName={project?.name}
                        onResultsFound={(results) => {
                            console.log('Search results:', results);
                        }}
                    />
                    
                    <BRDSections brd={brd} />
                </>
            )}

            {/* Regenerate button */}
            {brd && !isGenerating && (
                <div className="flex justify-center pb-8">
                    <Button onClick={handleGenerate} variant="outline" disabled={generateMutation.isPending}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate BRD
                    </Button>
                </div>
            )}
        </div>
    );
}
