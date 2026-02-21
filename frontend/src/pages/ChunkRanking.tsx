import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, RefreshCw, TrendingUp, Loader2, BarChart3, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';

interface RankedChunk {
    id: string;
    content: string;
    rank: number;
    finalScore: number;
    relevanceScore: number;
    semanticScore: number;
    diversityScore: number;
}

interface RankingStats {
    totalChunks: number;
    relevantChunks: number;
    averageScore: number;
    scoreDistribution: { range: string; count: number }[];
}

export default function ChunkRanking() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [topN, setTopN] = useState(50);
    const [relevanceWeight, setRelevanceWeight] = useState(0.5);
    const [semanticWeight, setSemanticWeight] = useState(0.3);
    const [diversityWeight, setDiversityWeight] = useState(0.2);
    const [query, setQuery] = useState('business requirements, functional requirements, objectives');
    const [category, setCategory] = useState<string>('all');
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingSteps = [
        { label: 'Fetching Chunks', description: 'Loading relevant chunks from database', icon: '📦' },
        { label: 'Calculating Semantic Scores', description: 'Computing embedding similarities', icon: '🧠' },
        { label: 'Analyzing Diversity', description: 'Measuring content uniqueness', icon: '🔍' },
        { label: 'Computing Final Scores', description: 'Applying weighted ranking algorithm', icon: '⚡' },
        { label: 'Sorting Results', description: 'Ordering chunks by relevance', icon: '✨' },
    ];

    // Fetch ranking stats
    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<RankingStats>({
        queryKey: ['ranking-stats', projectId],
        queryFn: async () => {
            try {
                return await api.getRankingStats(projectId!);
            } catch (error: any) {
                console.error('Failed to fetch ranking stats:', error);
                throw error;
            }
        },
        enabled: !!projectId,
        retry: 1,
    });

    // Re-rank mutation
    const reRankMutation = useMutation({
        mutationFn: async () => {
            if (category === 'all') {
                return await api.reRankChunks(projectId!, {
                    topN,
                    relevanceWeight,
                    semanticWeight,
                    diversityWeight,
                    query,
                });
            } else {
                return await api.getRankedChunksByCategory(projectId!, category, topN);
            }
        },
        onSuccess: () => {
            toast({
                title: "Chunks Re-ranked",
                description: "Chunk ranking completed successfully",
            });
        },
        onError: () => {
            toast({
                title: "Ranking Failed",
                description: "Failed to re-rank chunks. Please try again.",
                variant: "destructive",
            });
        },
    });

    // Batch re-rank mutation
    const batchReRankMutation = useMutation({
        mutationFn: async () => {
            return await api.batchReRankChunks(projectId!, 100);
        },
        onSuccess: () => {
            toast({
                title: "Batch Re-ranking Complete",
                description: "All chunks have been re-ranked and updated in the database",
            });
        },
    });

    const rankedChunks = reRankMutation.data?.chunks as RankedChunk[] | undefined;

    // Simulate loading steps
    useEffect(() => {
        if (reRankMutation.isPending) {
            setLoadingStep(0);
            const interval = setInterval(() => {
                setLoadingStep((prev) => {
                    if (prev < loadingSteps.length - 1) {
                        return prev + 1;
                    }
                    return prev;
                });
            }, 800);
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [reRankMutation.isPending]);

    const handleReRank = () => {
        reRankMutation.mutate();
    };

    const handleBatchReRank = () => {
        if (confirm('This will re-rank and update all chunks in the database. Continue?')) {
            batchReRankMutation.mutate();
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/ingest`)} className="mb-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Project
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Chunk Ranking</h1>
                <p className="text-muted-foreground mt-1">
                    Analyze and re-rank chunks based on relevance, semantic similarity, and diversity
                </p>
            </div>

            {/* Statistics Cards */}
            {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : statsError ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            Failed to load ranking statistics. Make sure you have processed the project first.
                        </p>
                        <Button onClick={() => navigate(`/projects/${projectId}/ingest`)}>
                            Go to Data Ingestion
                        </Button>
                    </CardContent>
                </Card>
            ) : stats ? (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalChunks || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Relevant Chunks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.relevantChunks || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.totalChunks > 0 
                                    ? ((stats.relevantChunks / stats.totalChunks) * 100).toFixed(1)
                                    : '0.0'}% of total
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.averageScore ? stats.averageScore.toFixed(3) : '0.000'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">High Quality</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.scoreDistribution?.[4]?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Score 0.8-1.0</p>
                        </CardContent>
                    </Card>
                </div>
            ) : null}

            {/* Score Distribution */}
            {stats && stats.scoreDistribution && stats.scoreDistribution.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Score Distribution
                        </CardTitle>
                        <CardDescription>Distribution of chunk relevance scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.scoreDistribution.map((dist) => {
                                const percentage = stats.relevantChunks > 0 
                                    ? (dist.count / stats.relevantChunks) * 100 
                                    : 0;
                                return (
                                    <div key={dist.range}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{dist.range}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {dist.count} chunks ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary rounded-full h-2 transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ranking Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Re-rank Chunks
                    </CardTitle>
                    <CardDescription>
                        Configure ranking parameters and re-rank chunks
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger id="category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Chunks</SelectItem>
                                    <SelectItem value="functional_req">Functional Requirements</SelectItem>
                                    <SelectItem value="nonfunctional_req">Non-Functional Requirements</SelectItem>
                                    <SelectItem value="objective">Business Objectives</SelectItem>
                                    <SelectItem value="stakeholder">Stakeholders</SelectItem>
                                    <SelectItem value="constraint">Constraints</SelectItem>
                                    <SelectItem value="risk">Risks</SelectItem>
                                    <SelectItem value="timeline">Timeline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="topN">
                                Top N Chunks to Use for BRD
                                <span className="text-xs text-muted-foreground ml-2">
                                    (Select best chunks to include)
                                </span>
                            </Label>
                            <Select 
                                value={topN.toString()} 
                                onValueChange={(value: string) => setTopN(parseInt(value))}
                            >
                                <SelectTrigger id="topN">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">Top 5 chunks</SelectItem>
                                    <SelectItem value="10">Top 10 chunks</SelectItem>
                                    <SelectItem value="20">Top 20 chunks</SelectItem>
                                    <SelectItem value="30">Top 30 chunks</SelectItem>
                                    <SelectItem value="50">Top 50 chunks</SelectItem>
                                    <SelectItem value="100">Top 100 chunks</SelectItem>
                                    <SelectItem value="200">All chunks (up to 200)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {category === 'all' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="query">Semantic Query</Label>
                                <Input
                                    id="query"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Enter keywords for semantic matching..."
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="relevanceWeight">
                                        Relevance Weight ({relevanceWeight.toFixed(1)})
                                    </Label>
                                    <Input
                                        id="relevanceWeight"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={relevanceWeight}
                                        onChange={(e) => setRelevanceWeight(parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="semanticWeight">
                                        Semantic Weight ({semanticWeight.toFixed(1)})
                                    </Label>
                                    <Input
                                        id="semanticWeight"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={semanticWeight}
                                        onChange={(e) => setSemanticWeight(parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="diversityWeight">
                                        Diversity Weight ({diversityWeight.toFixed(1)})
                                    </Label>
                                    <Input
                                        id="diversityWeight"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={diversityWeight}
                                        onChange={(e) => setDiversityWeight(parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleReRank} disabled={reRankMutation.isPending}>
                            {reRankMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Ranking...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Re-rank Chunks
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleBatchReRank}
                            disabled={batchReRankMutation.isPending}
                        >
                            {batchReRankMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Batch Re-rank & Update DB'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State with Steps */}
            {reRankMutation.isPending && (
                <Card className="bg-slate-950 border-slate-800">
                    <CardContent className="py-12">
                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center justify-center mb-8">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-blue-500" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-xl font-medium text-center mb-2 text-white">
                                Ranking Chunks...
                            </h3>
                            <p className="text-sm text-slate-400 text-center mb-8">
                                Analyzing and ranking chunks based on your criteria
                            </p>
                            <div className="space-y-3">
                                {loadingSteps.map((step, index) => {
                                    const isActive = index === loadingStep;
                                    const isComplete = index < loadingStep;
                                    return (
                                        <div
                                            key={step.label}
                                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                                                isActive
                                                    ? 'bg-blue-500/10 border-blue-500/50'
                                                    : isComplete
                                                    ? 'bg-green-500/10 border-green-500/50'
                                                    : 'bg-slate-900/50 border-slate-800'
                                            }`}
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-700">
                                                {isComplete ? (
                                                    <Check className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <span className="text-xl">{step.icon}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className={`text-sm font-medium ${
                                                        isActive ? 'text-blue-400' : isComplete ? 'text-green-400' : 'text-slate-400'
                                                    }`}>
                                                        {step.label}
                                                    </h4>
                                                    {isActive && (
                                                        <span className="text-xs text-blue-400 font-mono">
                                                            {Math.floor(((index + 1) / loadingSteps.length) * 100)}%
                                                        </span>
                                                    )}
                                                    {isComplete && (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500">{step.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ranked Chunks Results */}
            {rankedChunks && rankedChunks.length > 0 && (
                <>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Ranked Chunks ({rankedChunks.length})</CardTitle>
                                    <CardDescription>
                                        Top chunks sorted by final score
                                    </CardDescription>
                                </div>
                                <Button 
                                    onClick={() => navigate(`/projects/${projectId}/brd`)}
                                    className="gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    Use Top {Math.min(topN, rankedChunks.length)} for BRD
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                            Ready to Generate BRD
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            These top {Math.min(topN, rankedChunks.length)} chunks will be used for BRD generation. 
                                            Click "Use Top {Math.min(topN, rankedChunks.length)} for BRD" to proceed to the BRD editor.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {rankedChunks.map((chunk) => (
                                    <div
                                        key={chunk.id}
                                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                                                    {chunk.rank}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        Final Score: {chunk.finalScore?.toFixed(3) || '0.000'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex gap-4 mt-1">
                                                        <span>Relevance: {chunk.relevanceScore?.toFixed(3) || '0.000'}</span>
                                                        <span>Semantic: {chunk.semanticScore?.toFixed(3) || '0.000'}</span>
                                                        <span>Diversity: {chunk.diversityScore?.toFixed(3) || '0.000'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                            {chunk.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
