import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, FileText, Upload, Zap, CheckCircle2 } from 'lucide-react';

export default function NewProject() {
    const navigate = useNavigate();
    const { addProject, setCurrentProject } = useProjectStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const createMutation = useMutation({
        mutationFn: () => api.createProject({ name, description }),
        onSuccess: (project) => {
            addProject(project);
            setCurrentProject(project);
            navigate(`/projects/${project.id}/ingest`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            createMutation.mutate();
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-8 relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob" style={{ top: '10%', left: '5%' }} />
                <div className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" style={{ top: '50%', right: '5%' }} />
            </div>

            {/* Header */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')} 
                    className="mb-4 hover:bg-blue-100 dark:hover:bg-blue-900 transform hover:scale-105 transition-all duration-300 group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                    Create New Project
                </h1>
                <p className="text-muted-foreground mt-1">
                    Start a new BRD generation project with AI-powered analysis
                </p>
            </div>

            {/* Form */}
            <Card className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Project Details
                    </CardTitle>
                    <CardDescription>
                        Provide basic information about your project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-slate-900 dark:text-white">
                                Project Name *
                            </label>
                            <Input
                                id="name"
                                placeholder="E-Commerce Platform Redesign"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-slate-900 dark:text-white">
                                Description (Optional)
                            </label>
                            <Textarea
                                id="description"
                                placeholder="Modernize the existing e-commerce platform with improved UX and performance..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={!name.trim() || createMutation.isPending}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                                        Create Project
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/dashboard')}
                                className="transform hover:scale-105 transition-all duration-300"
                            >
                                Cancel
                            </Button>
                        </div>

                        {createMutation.isError && (
                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800 animate-fadeIn">
                                Error: {(createMutation.error as Error).message}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Info */}
            <Card className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow`}>
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 group cursor-pointer p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                            1
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Upload Data Sources
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                Add documents, emails, meeting transcripts, or manual text
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 group cursor-pointer p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-300">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                            2
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                AI Processing
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                Our AI filters noise and extracts key requirements
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 group cursor-pointer p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition-all duration-300">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                            3
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                Generate BRD
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                Get a professional, structured Business Requirements Document
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
