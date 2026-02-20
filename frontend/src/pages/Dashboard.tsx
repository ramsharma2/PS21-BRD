import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your BRD projects and track progress
                    </p>
                </div>
                <Button onClick={() => navigate('/projects/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projects?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects?.filter((p) => p.status === 'processing' || p.status === 'ingesting').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects?.filter((p) => p.status === 'ready').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Errors</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects?.filter((p) => p.status === 'error').length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Projects list */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Your latest BRD generation projects</CardDescription>
                </CardHeader>
                <CardContent>
                    {!projects || projects.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first project to start generating BRDs
                            </p>
                            <Button onClick={() => navigate('/projects/new')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Project
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => {
                                        setCurrentProject(project);
                                        navigate(`/projects/${project.id}/ingest`);
                                    }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold">{project.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>{formatRelativeTime(project.updatedAt)}</span>
                                            {project._count && (
                                                <>
                                                    <span>• {project._count.sources} sources</span>
                                                    <span>• {project._count.extractions} extractions</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Open
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
