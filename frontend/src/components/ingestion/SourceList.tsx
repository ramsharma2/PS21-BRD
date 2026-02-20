import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Source } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Mail, MessageSquare, Mic } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface SourceListProps {
    projectId: string;
    sources: Source[];
}

const SOURCE_ICONS = {
    email: Mail,
    slack: MessageSquare,
    transcript: Mic,
    document: FileText,
    manual: FileText,
};

export default function SourceList({ projectId, sources }: SourceListProps) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (sourceId: string) => api.deleteSource(sourceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sources', projectId] });
        },
    });

    if (sources.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No sources yet</h3>
                    <p className="text-muted-foreground">
                        Upload documents or add manual text to get started
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Sources ({sources.length})</CardTitle>
                <CardDescription>
                    Documents and text that will be processed for BRD generation
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sources.map((source) => {
                        const Icon = SOURCE_ICONS[source.sourceType] || FileText;
                        const label = source.metadata?.sourceLabel || source.metadata?.filename || 'Untitled';

                        return (
                            <div
                                key={source.id}
                                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{label}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span className="capitalize">{source.sourceType}</span>
                                                <span>•</span>
                                                <span>{formatRelativeTime(source.ingestedAt)}</span>
                                                {source.metadata?.size && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{Math.round(source.metadata.size / 1024)} KB</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0"
                                            onClick={() => deleteMutation.mutate(source.id)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>

                                    {source.metadata?.author && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            By {source.metadata.author}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
