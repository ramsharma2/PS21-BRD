import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import ConflictList from '@/components/brd/ConflictList';
import { useToast } from '@/components/ui/use-toast';

export default function Conflicts() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, setCurrentProject } = useProjectStore();
    const { toast } = useToast();
    const [isDetecting, setIsDetecting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

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
        <div className="max-w-5xl mx-auto space-y-6 pb-8 relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-blob" style={{ top: '10%', left: '5%' }} />
                <div className="absolute w-96 h-96 bg-red-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" style={{ top: '50%', right: '5%' }} />
            </div>

            <div className={`flex items-center justify-between transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div>
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(`/projects/${projectId}/brd`)} 
                        className="mb-2 hover:bg-blue-100 dark:hover:bg-blue-900 transform hover:scale-105 transition-all duration-300 group"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        Back to Editor
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-yellow-900 to-red-900 dark:from-slate-100 dark:via-yellow-100 dark:to-red-100 bg-clip-text text-transparent">
                        Conflict Detection
                    </h1>
                    <p className="text-muted-foreground mt-1">{project?.name || 'Loading...'}</p>
                </div>
                <Button 
                    onClick={handleDetect} 
                    disabled={isDetecting || detectMutation.isPending}
                    className="bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                    {isDetecting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Detecting...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                            Run Detection
                        </>
                    )}
                </Button>
            </div>

            <div className={`grid gap-4 md:grid-cols-3 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Total Conflicts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors animate-countUp">
                            {conflicts?.length || 0}
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp animation-delay-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                            Open Issues
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-2 animate-countUp">
                            {openConflicts.length}
                            {openConflicts.length > 0 && <AlertTriangle className="h-6 w-6 animate-pulse-slow" />}
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp animation-delay-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            Resolved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-500 flex items-center gap-2 animate-countUp">
                            {resolvedConflicts.length}
                            {resolvedConflicts.length > 0 && <CheckCircle className="h-6 w-6 animate-pulse-slow" />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className={`space-y-4 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Active Conflicts</h2>
                    {openConflicts.length > 0 && (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium animate-pulse-slow">
                            {openConflicts.length} pending
                        </span>
                    )}
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-600/30 border-t-yellow-600 mx-auto"></div>
                                <Sparkles className="h-6 w-6 text-yellow-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <p className="text-muted-foreground font-medium">Analyzing conflicts...</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fadeInUp">
                        <ConflictList conflicts={conflicts || []} projectId={projectId} />
                    </div>
                )}
            </div>
        </div>
    );
}
