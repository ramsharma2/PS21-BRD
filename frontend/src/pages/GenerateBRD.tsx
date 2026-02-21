import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TemplateSelector } from '../components/brd/TemplateSelector';
import { Card } from '../components/ui/card';
import { api } from '../services/api';
import { useToast } from '../components/ui/use-toast';

export function GenerateBRD() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleTemplateSelect = async (templateId: string) => {
        if (!projectId) return;

        setIsGenerating(true);
        try {
            await api.post(`/brd/generate/${projectId}`, { templateId });
            
            toast({
                title: 'Success',
                description: 'BRD generated successfully!',
            });

            navigate(`/projects/${projectId}/brd`);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to generate BRD. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCancel = () => {
        navigate(`/projects/${projectId}`);
    };

    if (isGenerating) {
        return (
            <div className="container mx-auto py-8">
                <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold mb-2">Generating BRD...</h2>
                    <p className="text-muted-foreground">
                        AI is analyzing your requirements and creating the document
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <TemplateSelector onSelect={handleTemplateSelect} onCancel={handleCancel} />
        </div>
    );
}
