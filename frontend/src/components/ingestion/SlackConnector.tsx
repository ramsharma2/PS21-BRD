import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slack, AlertTriangle, Sparkles, CheckCircle2, Link as LinkIcon } from 'lucide-react';
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
    const [isConnected, setIsConnected] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            // Call backend to initiate OAuth
            const response = await fetch('/api/integrations/slack/auth', {
                headers: {
                    'Authorization': `Bearer ${(window as any).__GET_TOKEN__?.()}`,
                },
            });
            const data = await response.json();
            
            if (data.data?.authUrl) {
                // Redirect to Slack OAuth
                window.location.href = data.data.authUrl;
            } else {
                // OAuth not configured, show info
                toast({
                    title: "Slack OAuth Setup Required",
                    description: "Please configure Slack OAuth credentials in your backend environment. For now, you can paste conversations manually below.",
                    variant: "default"
                });
                setIsConnected(false);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Connection Info",
                description: "Slack OAuth is not yet configured. Use manual paste below to import conversations.",
                variant: "default"
            });
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
                sourceLabel: 'Slack Conversation',
                metadata: {
                    source: 'slack',
                    type: 'manual_paste',
                    timestamp: new Date().toISOString()
                }
            });

            toast({
                title: "Slack Content Added",
                description: "The conversation has been successfully imported.",
            });
            setManualContent('');
            onUploadComplete();
        } catch (error) {
            toast({
                title: "Import Failed",
                description: "Failed to add Slack content. Please try again.",
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
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Slack className="h-5 w-5 text-white" />
                        </div>
                        Connect Slack Workspace
                    </CardTitle>
                    <CardDescription>
                        Import conversations, threads, and channel messages directly from Slack
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100">OAuth Integration Available</p>
                            <p className="text-blue-700 dark:text-blue-300 mt-1">
                                Direct Slack integration requires workspace admin approval. Configure OAuth credentials in your backend, or use manual paste below.
                            </p>
                        </div>
                    </div>

                    <Button 
                        onClick={handleConnect} 
                        disabled={isConnecting}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                    >
                        {isConnecting ? (
                            <>
                                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <LinkIcon className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                                Connect to Slack
                            </>
                        )}
                    </Button>

                    {isConnected && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-fadeIn">
                            <CheckCircle2 className="h-4 w-4" />
                            Connected to Slack workspace
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-medium">Or paste conversation</span>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-base text-slate-900 dark:text-white">Manual Import</CardTitle>
                    <CardDescription>
                        Copy and paste Slack conversations or channel exports
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="slack-content" className="text-sm font-medium">Conversation Text</Label>
                        <Textarea
                            id="slack-content"
                            placeholder="Example format:&#10;&#10;@john.doe [10:30 AM]: We need to update the checkout flow...&#10;@jane.smith [10:32 AM]: Agreed, the current one is too slow.&#10;@john.doe [10:35 AM]: Let's add one-click payment options."
                            className="min-h-[200px] font-mono text-sm focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                            value={manualContent}
                            onChange={(e) => setManualContent(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Tip: Include usernames, timestamps, and full message content for better analysis
                        </p>
                    </div>
                    <Button 
                        onClick={handleManualSubmit} 
                        disabled={isSubmitting || !manualContent.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                    >
                        {isSubmitting ? (
                            <>
                                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                Import Conversation
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
