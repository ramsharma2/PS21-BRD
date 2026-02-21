import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BrainCircuit, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

export default function Analytics() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, setCurrentProject } = useProjectStore();

    // Fetch project
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => api.getProject(projectId!),
        enabled: !!projectId,
    });

    if (project && (!currentProject || currentProject.id !== project.id)) {
        setCurrentProject(project);
    }

    // Fetch Analytics data
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['analytics', projectId],
        queryFn: () => api.getAnalytics(projectId!),
        enabled: !!projectId,
    });

    if (!projectId) return <div>Project not found</div>;

    const sentimentData = analytics ? [
        { name: 'Functional', score: (analytics.breakdown.functional + 1) * 50 }, // Scale -1..1 to 0..100
        { name: 'Non-Functional', score: (analytics.breakdown.nonFunctional + 1) * 50 },
        { name: 'Constraints', score: (analytics.breakdown.constraints + 1) * 50 },
    ] : [];

    const getSentimentIcon = (sentiment: string) => {
        if (sentiment === 'positive') return <ThumbsUp className="h-6 w-6 text-green-500" />;
        if (sentiment === 'negative') return <ThumbsDown className="h-6 w-6 text-red-500" />;
        return <Minus className="h-6 w-6 text-gray-500" />;
    };

    const getSentimentColor = (sentiment: string) => {
        if (sentiment === 'positive') return 'bg-green-100 text-green-800';
        if (sentiment === 'negative') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };


    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/brd`)} className="mb-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Editor
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Project Analytics</h1>
                    <p className="text-muted-foreground mt-1">{project?.name || 'Loading...'}</p>
                </div>
            </div>

            {isLoading ? (
                <div>Loading analytics...</div>
            ) : analytics ? (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    {getSentimentIcon(analytics.sentiment)}
                                    <span className="text-2xl font-bold capitalize">{analytics.sentiment}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Score: {analytics.overallScore.toFixed(2)} (-1 to 1)
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Concerns Detected</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.stakeholderConcerns.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Potential issues with tone/focus</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.suggestions.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Improvement opportunities</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sentiment Breakdown</CardTitle>
                                <CardDescription>Sentiment score by requirement category (0-100 Scale)</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sentimentData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Bar dataKey="score" fill="#8884d8" name="Sentiment Score" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Stakeholder Concerns</CardTitle>
                                <CardDescription>Potential issues identified in requirement phrasing</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analytics.stakeholderConcerns.map((concern, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <BrainCircuit className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                            <span>{concern}</span>
                                        </li>
                                    ))}
                                    {analytics.stakeholderConcerns.length === 0 && (
                                        <li className="text-muted-foreground text-sm italic">No major concerns detected.</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Suggestions for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {analytics.suggestions.map((suggestion, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-md">
                                        <span className="font-bold text-primary mr-2">{i + 1}.</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div>No data available</div>
            )}
        </div>
    );
}
