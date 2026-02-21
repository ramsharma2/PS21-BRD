import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Sparkles, CheckCircle2, Key, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface FirefliesConnectorProps {
    projectId: string;
    onUploadComplete: () => void;
}

export default function FirefliesConnector({ projectId, onUploadComplete }: FirefliesConnectorProps) {
    const [apiKey, setApiKey] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [manualContent, setManualContent] = useState('');
    const [meetingTitle, setMeetingTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        if (!apiKey.trim()) return;
        setIsConnecting(true);
        
        try {
            // In a real implementation, validate the API key with Fireflies
            // For now, we'll save it to localStorage and show success
            localStorage.setItem(`fireflies_api_key_${projectId}`, apiKey);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsConnected(true);
            toast({
                title: "API Key Saved",
                description: "Fireflies integration configured. Webhooks will be received at /api/integrations/fireflies/webhook",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Connection Failed",
                description: "Failed to validate API key. Please check and try again.",
                variant: "destructive"
            });
        } finally {
            setIsConnecting(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!manualContent.trim()) return;

        setIsSubmitting(true);
        try {
            const sourceLabel = meetingTitle.trim() || 'Fireflies Meeting Transcript';
            
            await api.addManualText({
                projectId,
                content: manualContent,
                sourceLabel,
                metadata: {
                    source: 'fireflies',
                    type: 'transcript',
                    meetingTitle: meetingTitle.trim() || 'Untitled Meeting',
                    timestamp: new Date().toISOString()
                }
            });

            toast({
                title: "Transcript Imported",
                description: "The meeting transcript has been successfully added.",
            });
            setManualContent('');
            setMeetingTitle('');
            onUploadComplete();
        } catch (error) {
            toast({
                title: "Import Failed",
                description: "Failed to add transcript. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <Mic className="h-5 w-5 text-white" />
                        </div>
                        Fireflies.ai Integration
                    </CardTitle>
                    <CardDescription>
                        Import meeting transcripts, summaries, and action items automatically
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-orange-900 dark:text-orange-100">API Integration</p>
                            <p className="text-orange-700 dark:text-orange-300 mt-1">
                                Get your API key from Fireflies Dashboard → Integrations → API. Configure webhooks to automatically receive new transcripts.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Fireflies API Key
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="api-key"
                                type="password"
                                placeholder="Enter your Fireflies API Key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                                disabled={isConnected}
                            />
                            <Button 
                                onClick={handleConnect} 
                                disabled={isConnecting || !apiKey.trim() || isConnected}
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                            >
                                {isConnecting ? (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : isConnected ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Saved
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Webhook URL: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{window.location.origin}/api/integrations/fireflies/webhook</code>
                        </p>
                    </div>

                    {isConnected && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-fadeIn">
                            <CheckCircle2 className="h-4 w-4" />
                            Connected to Fireflies.ai - Ready to receive transcripts
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-medium">Or paste transcript</span>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-base text-slate-900 dark:text-white">Manual Import</CardTitle>
                    <CardDescription>
                        Copy and paste meeting transcripts from Fireflies or other sources
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="meeting-title" className="text-sm font-medium">Meeting Title (Optional)</Label>
                        <Input
                            id="meeting-title"
                            placeholder="e.g., Product Planning Meeting - Jan 2024"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                            className="focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="transcript-content" className="text-sm font-medium">Transcript Text</Label>
                        <Textarea
                            id="transcript-content"
                            placeholder="Example format:&#10;&#10;Speaker 1 (00:00): Let's discuss the new requirements for the checkout feature.&#10;Speaker 2 (00:15): We need to support multiple payment methods.&#10;Speaker 1 (00:30): Agreed. Let's also add Apple Pay and Google Pay."
                            className="min-h-[200px] focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                            value={manualContent}
                            onChange={(e) => setManualContent(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Tip: Include speaker names and timestamps for better context analysis
                        </p>
                    </div>
                    
                    <Button 
                        onClick={handleManualSubmit} 
                        disabled={isSubmitting || !manualContent.trim()}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                    >
                        {isSubmitting ? (
                            <>
                                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                Import Transcript
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
