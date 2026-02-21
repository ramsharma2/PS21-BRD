import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Share2, Download, Trash2, Edit, MoreVertical } from 'lucide-react';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToPDF, exportToDOCX, exportToMarkdown } from '@/services/exportService';

export default function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { setProjects, setCurrentProject } = useProjectStore();
    const { toast } = useToast();
    const [loadingBRDs, setLoadingBRDs] = useState<Record<string, boolean>>({});
    const [isVisible, setIsVisible] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

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

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (projectId: string) => api.deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                title: "Project Deleted",
                description: "Project has been successfully deleted",
            });
            setDeleteDialogOpen(false);
            setSelectedProject(null);
        },
        onError: () => {
            toast({
                title: "Delete Failed",
                description: "Failed to delete project. Please try again.",
                variant: "destructive",
            });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => 
            api.updateProject(id, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                title: "Project Updated",
                description: "Project name has been successfully updated",
            });
            setEditDialogOpen(false);
            setSelectedProject(null);
            setEditName('');
        },
        onError: () => {
            toast({
                title: "Update Failed",
                description: "Failed to update project. Please try again.",
                variant: "destructive",
            });
        },
    });

    const handleDeleteClick = (e: React.MouseEvent, project: any) => {
        e.stopPropagation();
        setSelectedProject(project);
        setDeleteDialogOpen(true);
    };

    const handleEditClick = (e: React.MouseEvent, project: any) => {
        e.stopPropagation();
        setSelectedProject(project);
        setEditName(project.name);
        setEditDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedProject) {
            deleteMutation.mutate(selectedProject.id);
        }
    };

    const handleEditSave = () => {
        if (selectedProject && editName.trim()) {
            updateMutation.mutate({ id: selectedProject.id, name: editName.trim() });
        }
    };

    const handleShare = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/projects/${projectId}/brd`;
        navigator.clipboard.writeText(shareUrl);
        toast({
            title: "Link Copied",
            description: "Project link copied to clipboard",
        });
    };

    const handleDownload = async (e: React.MouseEvent, projectId: string, projectName: string, format: 'pdf' | 'docx' | 'md') => {
        e.stopPropagation();
        
        try {
            setLoadingBRDs(prev => ({ ...prev, [projectId]: true }));
            
            // Fetch BRD
            const brd = await api.getBRD(projectId);
            
            if (!brd) {
                toast({
                    title: "No BRD Found",
                    description: "This project doesn't have a generated BRD yet.",
                    variant: "destructive",
                });
                return;
            }

            // Transform BRD for export
            const transformBRDForExport = (brd: any) => {
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
                    if (Array.isArray(data)) {
                        return data.map((item, i) => `${i + 1}. ${typeof item === 'object' ? formatObject(item) : item}`).join('\n');
                    }
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
            };

            const sections = transformBRDForExport(brd);
            const project = { name: projectName };

            switch (format) {
                case 'pdf':
                    await exportToPDF(project, sections);
                    break;
                case 'docx':
                    await exportToDOCX(project, sections);
                    break;
                case 'md':
                    await exportToMarkdown(project, sections);
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
        } finally {
            setLoadingBRDs(prev => ({ ...prev, [projectId]: false }));
        }
    };

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
        <div className="space-y-8 max-w-7xl pb-8 relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob" style={{ top: '10%', left: '5%' }} />
                <div className="absolute w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" style={{ top: '50%', right: '5%' }} />
            </div>

            {/* Hero Header - Compact */}
            <div className={`pt-4 pb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="max-w-4xl">
                    <h1 className="text-4xl font-normal tracking-tight mb-3 text-slate-900 dark:text-white animate-fadeInUp" style={{ fontWeight: 400 }}>
                        Welcome back
                    </h1>
                    <p className="text-base text-slate-600 dark:text-slate-400 mb-5 leading-relaxed animate-fadeInUp animation-delay-200" style={{ fontWeight: 400 }}>
                        Transform scattered requirements into professional Business Requirements Documents with AI-powered analysis
                    </p>
                    <Button 
                        onClick={() => navigate('/projects/new')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-5 text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fadeInUp animation-delay-400 group"
                    >
                        <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Create new project
                    </Button>
                </div>
            </div>

            {/* Stats Grid - Compact */}
            <div className={`grid gap-4 md:grid-cols-4 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp">
                    <div className="text-3xl font-normal text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" style={{ fontWeight: 400 }}>
                        {projects?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400" style={{ fontWeight: 500 }}>
                        Total projects
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp animation-delay-200">
                    <div className="text-3xl font-normal text-slate-900 dark:text-white mb-1 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" style={{ fontWeight: 400 }}>
                        {projects?.filter((p) => p.status === 'processing' || p.status === 'ingesting').length || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400" style={{ fontWeight: 500 }}>
                        In progress
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp animation-delay-400">
                    <div className="text-3xl font-normal text-slate-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" style={{ fontWeight: 400 }}>
                        {projects?.filter((p) => p.status === 'ready').length || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400" style={{ fontWeight: 500 }}>
                        Completed
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp animation-delay-600">
                    <div className="text-3xl font-normal text-slate-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" style={{ fontWeight: 400 }}>
                        {projects?.filter((p) => p.status === 'error').length || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400" style={{ fontWeight: 500 }}>
                        Need attention
                    </div>
                </div>
            </div>

            {/* Projects Section */}
            <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="mb-5">
                    <h2 className="text-2xl font-normal tracking-tight text-slate-900 dark:text-white mb-1" style={{ fontWeight: 400 }}>
                        Your projects
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontWeight: 400 }}>
                        Recent BRD generation projects
                    </p>
                </div>

                {!projects || projects.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center animate-fadeInUp">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-normal mb-2 text-slate-900 dark:text-white" style={{ fontWeight: 400 }}>
                                No projects yet
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6" style={{ fontWeight: 400 }}>
                                Get started by creating your first project. Upload documents, add requirements, and let AI generate your BRD.
                            </p>
                            <Button 
                                onClick={() => navigate('/projects/new')} 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-5 text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                            >
                                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                Create your first project
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fadeInUp"
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={() => {
                                    setCurrentProject(project);
                                    navigate(`/projects/${project.id}/ingest`);
                                }}
                            >
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-base font-normal text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate" style={{ fontWeight: 500 }}>
                                                    {project.name}
                                                </h3>
                                                <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${getStatusColor(project.status)} transform group-hover:scale-110 transition-transform duration-300`} style={{ fontWeight: 500 }}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400" style={{ fontWeight: 400 }}>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatRelativeTime(project.updatedAt)}
                                                </span>
                                                {project._count && (
                                                    <span className="flex items-center gap-1.5">
                                                        <FileText className="h-3.5 w-3.5" />
                                                        {project._count.sources} {project._count.sources === 1 ? 'source' : 'sources'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Edit and Delete buttons - always visible */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transform hover:scale-110 transition-all duration-300"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="More actions"
                                                    >
                                                        <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenuItem onClick={(e) => handleEditClick(e, project)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Project
                                                    </DropdownMenuItem>
                                                    {project.status === 'ready' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={(e) => handleShare(e, project.id)}>
                                                                <Share2 className="h-4 w-4 mr-2" />
                                                                Share Link
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handleDownload(e, project.id, project.name, 'pdf')}>
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download PDF
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handleDownload(e, project.id, project.name, 'docx')}>
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download DOCX
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handleDownload(e, project.id, project.name, 'md')}>
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download Markdown
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => handleDeleteClick(e, project)}
                                                        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Project
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete Project
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{selectedProject?.name}"</span>? 
                            This action cannot be undone and will permanently delete all associated data including sources, extractions, and BRD content.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="transform hover:scale-105 transition-all duration-300">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleteMutation.isPending}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transform hover:scale-105 transition-all duration-300"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Project
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Project Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Edit className="h-5 w-5" />
                            Edit Project
                        </DialogTitle>
                        <DialogDescription>
                            Update the project name. This will be reflected across all views.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input
                                id="project-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter project name"
                                className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && editName.trim()) {
                                        handleEditSave();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            className="transform hover:scale-105 transition-all duration-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSave}
                            disabled={!editName.trim() || updateMutation.isPending}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-105 transition-all duration-300"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
