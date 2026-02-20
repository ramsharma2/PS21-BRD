import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

export default function NewProject() {
    const navigate = useNavigate();
    const { addProject, setCurrentProject } = useProjectStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

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
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
                <p className="text-muted-foreground mt-1">
                    Start a new BRD generation project
                </p>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>
                        Provide basic information about your project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Project Name *
                            </label>
                            <Input
                                id="name"
                                placeholder="E-Commerce Platform Redesign"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description (Optional)
                            </label>
                            <Textarea
                                id="description"
                                placeholder="Modernize the existing e-commerce platform with improved UX and performance..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={!name.trim() || createMutation.isPending}
                            >
                                {createMutation.isPending ? 'Creating...' : 'Create Project'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/')}
                            >
                                Cancel
                            </Button>
                        </div>

                        {createMutation.isError && (
                            <div className="text-sm text-destructive">
                                Error: {(createMutation.error as Error).message}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Info */}
            <Card>
                <CardHeader>
                    <CardTitle>What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            1
                        </div>
                        <div>
                            <div className="font-medium">Upload Data Sources</div>
                            <div className="text-sm text-muted-foreground">
                                Add documents, emails, meeting transcripts, or manual text
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            2
                        </div>
                        <div>
                            <div className="font-medium">AI Processing</div>
                            <div className="text-sm text-muted-foreground">
                                Our AI filters noise and extracts key requirements
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            3
                        </div>
                        <div>
                            <div className="font-medium">Generate BRD</div>
                            <div className="text-sm text-muted-foreground">
                                Get a professional, structured Business Requirements Document
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
