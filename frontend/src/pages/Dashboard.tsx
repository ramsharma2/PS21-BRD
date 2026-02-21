import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';

export default function Dashboard() {
    const navigate = useNavigate();
    const { setProjects, setCurrentProject } = useProjectStore();

    // Fetch projects
    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => api.getProjects(),
    });

    useEffect(() => {
        if (projects) {
            setProjects(projects);
        }
    }, [projects, setProjects]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary mx-auto"></div>
                        <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-muted-foreground font-medium">Loading your projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-6 md:p-8">
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium mb-3 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>AI-Powered Documentation</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Welcome back!
                    </h1>
                    <p className="text-base text-muted-foreground mb-4 max-w-2xl">
                        Transform scattered requirements into professional Business Requirements Documents in minutes with AI
                    </p>
                    <Button 
                        onClick={() => navigate('/projects/new')}
                        className="shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Project
                    </Button>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {projects?.length || 0}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Projects</p>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                {projects?.filter((p) => p.status === 'processing' || p.status === 'ingesting').length || 0}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">In Progress</p>
                        <p className="text-xs text-muted-foreground mt-1">Active now</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {projects?.filter((p) => p.status === 'ready').length || 0}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</p>
                        <p className="text-xs text-muted-foreground mt-1">Ready to view</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {projects?.filter((p) => p.status === 'error').length || 0}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Errors</p>
                        <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Projects Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Recent Projects</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Your latest BRD generation projects</p>
                    </div>
                </div>

                {!projects || projects.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <FileText className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Get started by creating your first project. Upload documents, add requirements, and let AI generate your BRD.
                            </p>
                            <Button size="lg" onClick={() => navigate('/projects/new')}>
                                <Plus className="h-5 w-5 mr-2" />
                                Create Your First Project
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card
                                key={project.id}
                                className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-none shadow-sm overflow-hidden"
                                onClick={() => {
                                    setCurrentProject(project);
                                    navigate(`/projects/${project.id}/ingest`);
                                }}
                            >
                                <CardContent className="p-6">
                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>

                                    {/* Project Name */}
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                        {project.name}
                                    </h3>

                                    {/* Description */}
                                    {project.description && (
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatRelativeTime(project.updatedAt)}
                                        </span>
                                        {project._count && (
                                            <>
                                                <span>•</span>
                                                <span>{project._count.sources} sources</span>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
