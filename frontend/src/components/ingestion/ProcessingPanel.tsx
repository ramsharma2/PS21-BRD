import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { ProjectStats } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
        </Card>
    );
}
