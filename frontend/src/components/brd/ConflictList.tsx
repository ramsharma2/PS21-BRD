import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Conflict } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ConflictListProps {
    conflicts: Conflict[];
    projectId: string;
}

export default function ConflictList({ conflicts, projectId }: ConflictListProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [resolutions, setResolutions] = useState<Record<string, string>>({});

    const resolveMutation = useMutation({
        mutationFn: ({ id, resolution, status }: { id: string; resolution: string; status: 'resolved' | 'ignored' }) =>
            api.resolveConflict(id, resolution, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conflicts', projectId] });
            toast({
                title: 'Conflict Resolved',
                description: 'The conflict has been updated successfully.',
            });
        },
    });

    const handleResolve = (id: string, status: 'resolved' | 'ignored') => {
        const resolution = resolutions[id] || '';
        if (status === 'resolved' && !resolution) {
            toast({
                title: "Resolution Required",
                description: "Please provide a resolution text before marking as resolved.",
                variant: "destructive"
            });
            return;
        }
        resolveMutation.mutate({ id, resolution, status });
    };

    if (conflicts.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No Conflicts Detected</h3>
                <p className="text-muted-foreground mt-2">
                    Your requirements appear to be consistent.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {conflicts.map((conflict) => (
                <Card key={conflict.id} className={cn("border-l-4", {
                    "border-l-red-500": conflict.severity === 'high' && conflict.status === 'open',
                    "border-l-yellow-500": conflict.severity === 'medium' && conflict.status === 'open',
                    "border-l-blue-500": conflict.severity === 'low' && conflict.status === 'open',
                    "border-l-green-500": conflict.status === 'resolved',
                    "border-l-gray-300": conflict.status === 'ignored',
                    "opacity-75": conflict.status !== 'open'
                })}>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {conflict.status === 'open' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                                    {conflict.status === 'resolved' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    {conflict.status === 'ignored' && <XCircle className="h-5 w-5 text-gray-500" />}
                                    Conflict Found
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Severity: <Badge variant={conflict.severity === 'high' ? 'destructive' : 'secondary'}>{conflict.severity.toUpperCase()}</Badge>
                                </CardDescription>
                            </div>
                            <Badge variant="outline">{conflict.status.toUpperCase()}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm font-medium">{conflict.description}</p>

                        <div className="grid md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md text-sm">
                            <div className="space-y-2">
                                <span className="font-semibold text-muted-foreground">Requirement A</span>
                                <div className="p-3 bg-background border rounded">
                                    {conflict.itemA?.content || 'Loading...'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="font-semibold text-muted-foreground">Requirement B</span>
                                <div className="p-3 bg-background border rounded">
                                    {conflict.itemB?.content || 'Loading...'}
                                </div>
                            </div>
                        </div>

                        {conflict.status === 'open' && (
                            <div className="mt-4">
                                <label className="text-sm font-medium mb-1.5 block">Resolution Strategy</label>
                                <Textarea
                                    placeholder={conflict.resolution || "Describe how to resolve this conflict..."}
                                    defaultValue={conflict.resolution || ''}
                                    onChange={(e) => setResolutions(prev => ({ ...prev, [conflict.id]: e.target.value }))}
                                    className="mb-2"
                                />
                                <p className="text-xs text-muted-foreground mb-4">
                                    AI Suggestion: {conflict.resolution || "No suggestion available."}
                                </p>
                            </div>
                        )}

                        {conflict.status !== 'open' && conflict.resolution && (
                            <div className="mt-4 pt-4 border-t">
                                <span className="text-sm font-semibold">Resolution:</span>
                                <p className="text-sm mt-1">{conflict.resolution}</p>
                            </div>
                        )}
                    </CardContent>
                    {conflict.status === 'open' && (
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => handleResolve(conflict.id, 'ignored')}>
                                Ignore
                            </Button>
                            <Button onClick={() => handleResolve(conflict.id, 'resolved')} disabled={resolveMutation.isPending}>
                                Mark Resolved
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            ))}
        </div>
    );
}
