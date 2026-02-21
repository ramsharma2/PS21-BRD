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
            <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 animate-fadeInUp">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                    <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Conflicts Detected</h3>
                <p className="text-muted-foreground mt-2">
                    Your requirements appear to be consistent.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {conflicts.map((conflict, index) => (
                <Card 
                    key={conflict.id} 
                    className={cn(
                        "border-l-4 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01] animate-fadeInUp bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
                        {
                            "border-l-red-500 hover:border-red-400": conflict.severity === 'high' && conflict.status === 'open',
                            "border-l-yellow-500 hover:border-yellow-400": conflict.severity === 'medium' && conflict.status === 'open',
                            "border-l-blue-500 hover:border-blue-400": conflict.severity === 'low' && conflict.status === 'open',
                            "border-l-green-500 hover:border-green-400": conflict.status === 'resolved',
                            "border-l-gray-300 hover:border-gray-400": conflict.status === 'ignored',
                            "opacity-75": conflict.status !== 'open'
                        }
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {conflict.status === 'open' && <AlertTriangle className="h-5 w-5 text-yellow-600 animate-pulse-slow" />}
                                    {conflict.status === 'resolved' && <CheckCircle className="h-5 w-5 text-green-600 animate-scaleIn" />}
                                    {conflict.status === 'ignored' && <XCircle className="h-5 w-5 text-gray-500" />}
                                    Conflict Found
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Severity: <Badge 
                                        variant={conflict.severity === 'high' ? 'destructive' : 'secondary'}
                                        className="transform hover:scale-110 transition-transform duration-300"
                                    >
                                        {conflict.severity.toUpperCase()}
                                    </Badge>
                                </CardDescription>
                            </div>
                            <Badge 
                                variant="outline"
                                className="transform hover:scale-110 transition-transform duration-300"
                            >
                                {conflict.status.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm font-medium">{conflict.description}</p>

                        <div className="grid md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
                            <div className="space-y-2 group">
                                <span className="font-semibold text-muted-foreground">Requirement A</span>
                                <div className="p-3 bg-background border rounded-lg transform group-hover:scale-105 transition-all duration-300 hover:shadow-md">
                                    {conflict.itemA?.content || 'Loading...'}
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <span className="font-semibold text-muted-foreground">Requirement B</span>
                                <div className="p-3 bg-background border rounded-lg transform group-hover:scale-105 transition-all duration-300 hover:shadow-md">
                                    {conflict.itemB?.content || 'Loading...'}
                                </div>
                            </div>
                        </div>

                        {conflict.status === 'open' && (
                            <div className="mt-4 animate-fadeIn">
                                <label className="text-sm font-medium mb-1.5 block">Resolution Strategy</label>
                                <Textarea
                                    placeholder={conflict.resolution || "Describe how to resolve this conflict..."}
                                    defaultValue={conflict.resolution || ''}
                                    onChange={(e) => setResolutions(prev => ({ ...prev, [conflict.id]: e.target.value }))}
                                    className="mb-2 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                />
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        AI Suggestion:
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300">
                                        {conflict.resolution || "No suggestion available."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {conflict.status !== 'open' && conflict.resolution && (
                            <div className="mt-4 pt-4 border-t animate-fadeIn">
                                <span className="text-sm font-semibold">Resolution:</span>
                                <p className="text-sm mt-1">{conflict.resolution}</p>
                            </div>
                        )}
                    </CardContent>
                    {conflict.status === 'open' && (
                        <CardFooter className="flex justify-end gap-2">
                            <Button 
                                variant="ghost" 
                                onClick={() => handleResolve(conflict.id, 'ignored')}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
                            >
                                Ignore
                            </Button>
                            <Button 
                                onClick={() => handleResolve(conflict.id, 'resolved')} 
                                disabled={resolveMutation.isPending}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                            >
                                <CheckCircle className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                                Mark Resolved
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            ))}
        </div>
    );
}
