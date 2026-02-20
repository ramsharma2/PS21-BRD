import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import ConflictList from '@/components/brd/ConflictList';
import { useToast } from '@/components/ui/use-toast';

export default function Conflicts() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, setCurrentProject } = useProjectStore();
    const { toast } = useToast();
    const [isDetecting, setIsDetecting] = useState(false);

    // Fetch project
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => api.getProject(projectId!),
        enabled: !!projectId,
    });

    // Update current project
    if (project && (!currentProject || currentProject.id !== project.id)) {
        setCurrentProject(project);
    }

    // Fetch conflicts
    const { data: conflicts, refetch, isLoading } = useQuery({
        queryKey: ['conflicts', projectId],
        queryFn: () => api.getConflicts(projectId!),
        enabled: !!projectId,
    });

    // Detect mutation
    const detectMutation = useMutation({
        mutationFn: () => api.detectConflicts(projectId!),
        onSuccess: (data) => {
            refetch();
            setIsDetecting(false);
            toast({
                title: "Detection Complete",
                description: `Found ${data.count} potential conflicts.`,
            });
        },
        onError: () => {
            setIsDetecting(false);
            toast({
                title: "Detection Failed",
                description: "Failed to run conflict detection.",
                variant: "destructive"
            });
        }
    });

    const handleDetect = () => {
        setIsDetecting(true);
        detectMutation.mutate();
    };

    if (!projectId) return <div>Project not found</div>;

    const openConflicts = conflicts?.filter(c => c.status === 'open') || [];
    const resolvedConflicts = conflicts?.filter(c => c.status !== 'open') || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/brd`)} className="mb-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Editor
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Conflict Detection</h1>
                    <p className="text-muted-foreground mt-1">{project?.name || 'Loading...'}</p>
                </div>
                <Button onClick={handleDetect} disabled={isDetecting || detectMutation.isPending}>
                    {isDetecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Run Detection
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Conflicts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conflicts?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
                            {openConflicts.length}
                            {openConflicts.length > 0 && <AlertTriangle className="h-5 w-5" />}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                            {resolvedConflicts.length}
                            {resolvedConflicts.length > 0 && <CheckCircle className="h-5 w-5" />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Active Conflicts</h2>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <ConflictList conflicts={conflicts || []} projectId={projectId} />
                )}
            </div>
        </div>
    );
}
