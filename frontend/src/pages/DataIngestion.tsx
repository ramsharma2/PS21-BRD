import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '@/components/ingestion/FileUpload';
import ManualTextInput from '@/components/ingestion/ManualTextInput';
import SourceList from '@/components/ingestion/SourceList';
import ProcessingPanel from '@/components/ingestion/ProcessingPanel';
import SlackConnector from '@/components/ingestion/SlackConnector';
import FirefliesConnector from '@/components/ingestion/FirefliesConnector';
import { ArrowLeft, ArrowRight, Slack, Mic, Database } from 'lucide-react';

export default function DataIngestion() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, setCurrentProject } = useProjectStore();
    const [activeTab, setActiveTab] = useState('upload');

    // Fetch project details
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => api.getProject(projectId!),
        enabled: !!projectId,
    });

    // Fetch sources
    const { data: sources = [], refetch: refetchSources } = useQuery({
        queryKey: ['sources', projectId],
        queryFn: () => api.getSources(projectId!),
        enabled: !!projectId,
    });

    // Update current project in store
    if (project && (!currentProject || currentProject.id !== project.id)) {
        setCurrentProject(project);
    }

    if (!projectId) {
        return <div>Project not found</div>;
    }

    const handleUploadComplete = () => {
        refetchSources();
    };

    const handleProcessingComplete = () => {
        // Navigate to BRD generation after processing
        navigate(`/projects/${projectId}/brd`);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate('/')} className="mb-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Data Ingestion</h1>
                    <p className="text-muted-foreground mt-1">
                        {project?.name || 'Loading...'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/projects/${projectId}/dataset-import`)}
                    >
                        <Database className="h-4 w-4 mr-2" />
                        Import Dataset
                    </Button>
                    <Button
                        onClick={() => navigate(`/projects/${projectId}/brd`)}
                        disabled={sources.length === 0}
                    >
                        Continue to BRD
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column - Input methods */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="upload">Files</TabsTrigger>
                            <TabsTrigger value="manual">Text</TabsTrigger>
                            <TabsTrigger value="slack" className="flex items-center gap-2">
                                <Slack className="h-3 w-3" />
                                <span className="hidden sm:inline">Slack</span>
                            </TabsTrigger>
                            <TabsTrigger value="fireflies" className="flex items-center gap-2">
                                <Mic className="h-3 w-3" />
                                <span className="hidden sm:inline">Fireflies</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="mt-6">
                            <FileUpload projectId={projectId} onUploadComplete={handleUploadComplete} />
                        </TabsContent>

                        <TabsContent value="manual" className="mt-6">
                            <ManualTextInput projectId={projectId} onSubmitComplete={handleUploadComplete} />
                        </TabsContent>

                        <TabsContent value="slack" className="mt-6">
                            <SlackConnector projectId={projectId} onUploadComplete={handleUploadComplete} />
                        </TabsContent>

                        <TabsContent value="fireflies" className="mt-6">
                            <FirefliesConnector projectId={projectId} onUploadComplete={handleUploadComplete} />
                        </TabsContent>
                    </Tabs>

                    {/* Sources list */}
                    <SourceList projectId={projectId} sources={sources} />
                </div>

                {/* Right column - Processing */}
                <div className="lg:col-span-1">
                    <ProcessingPanel
                        projectId={projectId}
                        sourceCount={sources.length}
                        onProcessingComplete={handleProcessingComplete}
                    />
                </div>
            </div>
        </div>
    );
}
