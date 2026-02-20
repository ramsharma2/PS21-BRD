import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slack, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface SlackConnectorProps {
    projectId: string;
    onUploadComplete: () => void;
}

export default function SlackConnector({ projectId, onUploadComplete }: SlackConnectorProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [manualContent, setManualContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        setIsConnecting(true);
        // Simulate Auth Flow or call placeholder endpoint
        try {
            // In a real app, this would redirect to OAuth
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast({
                title: "Integration Not Configured",
                description: "Slack OAuth is not yet fully configured in the backend environment.",
                variant: "destructive"
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
                sourceLabel: 'Slack Export',
                metadata: {
                    source: 'slack',
                    type: 'manual_paste'
                }
            });

            toast({
                title: "Slack Content Added",
                description: "The conversation has been added as a source.",
            });
            setManualContent('');
            onUploadComplete();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add Slack content.",
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
                        <Slack className="h-5 w-5" />
                        Connect Slack Workspace
                    </CardTitle>
                    <CardDescription>
                        Import conversations and threads directly from Slack
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-md flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium">Work in Progress</p>
                            <p className="text-muted-foreground">
                                Direct Slack integration requires admin approval. You can paste conversation exports below in the meantime.
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleConnect} disabled={isConnecting} className="w-full sm:w-auto">
                        {isConnecting ? 'Connecting...' : 'Connect to Slack'}
                    </Button>
                </CardContent>
            </Card>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste conversation</span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Manual Paste</CardTitle>
                    <CardDescription>
                        Paste a thread or channel export
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="slack-content">Conversation Text</Label>
                        <Textarea
                            id="slack-content"
                            placeholder="[User A]: We need to update the checkout flow...&#10;[User B]: Agreed, the current one is too slow."
                            className="min-h-[200px] font-mono text-sm"
                            value={manualContent}
                            onChange={(e) => setManualContent(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleManualSubmit} disabled={isSubmitting || !manualContent.trim()}>
                        {isSubmitting ? 'Importing...' : 'Import Conversation'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
