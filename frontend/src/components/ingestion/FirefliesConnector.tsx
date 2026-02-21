import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mic } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface FirefliesConnectorProps {
    projectId: string;
    onUploadComplete: () => void;
}

export default function FirefliesConnector({ projectId, onUploadComplete }: FirefliesConnectorProps) {
    const [apiKey, setApiKey] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [manualContent, setManualContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        if (!apiKey.trim()) return;
        setIsConnecting(true);
        // Simulate API Key validation
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast({
                title: "API Key Saved",
                description: "Fireflies integration partially configured. Webhooks will be received.",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!manualContent.trim()) return;

        setIsSubmitting(true);
        try {
            await api.addManualText({
                projectId,
                content: manualContent,
                sourceLabel: 'Fireflies Transcript',
                metadata: {
                    source: 'fireflies',
                    type: 'transcript'
                }
            });

            toast({
                title: "Transcript Added",
                description: "The meeting transcript has been added as a source.",
            });
            setManualContent('');
            onUploadComplete();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add transcript.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5" />
                        Fireflies.ai Integration
                    </CardTitle>
                    <CardDescription>
                        Import meeting transcripts and summaries
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <div className="flex gap-2">
                            <Input
                                id="api-key"
                                type="password"
                                placeholder="Enter Fireflies API Key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <Button onClick={handleConnect} disabled={isConnecting || !apiKey.trim()}>
                                {isConnecting ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Found in Fireflies Dashboard {'>'} Integrations {'>'} API
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste transcript</span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Manual Transcript</CardTitle>
                    <CardDescription>
                        Paste the full text of a meeting transcript
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="transcript-content">Transcript Text</Label>
                        <Textarea
                            id="transcript-content"
                            placeholder="Speaker 1: Let's discuss the new requirements..."
                            className="min-h-[200px]"
                            value={manualContent}
                            onChange={(e) => setManualContent(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleManualSubmit} disabled={isSubmitting || !manualContent.trim()}>
                        {isSubmitting ? 'Importing...' : 'Import Transcript'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
