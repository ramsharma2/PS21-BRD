import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';

interface ManualTextInputProps {
    projectId: string;
    onSubmitComplete?: () => void;
}

export default function ManualTextInput({ projectId, onSubmitComplete }: ManualTextInputProps) {
    const [content, setContent] = useState('');
    const [sourceLabel, setSourceLabel] = useState('');

    const submitMutation = useMutation({
        mutationFn: () =>
            api.addManualText({
                projectId,
                content,
                sourceLabel: sourceLabel || undefined,
            }),
        onSuccess: () => {
            setContent('');
            setSourceLabel('');
            onSubmitComplete?.();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            submitMutation.mutate();
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle>Manual Text Input</CardTitle>
                </div>
                <CardDescription>
                    Paste meeting notes, requirements, or any relevant text directly
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="sourceLabel" className="text-sm font-medium">
                            Source Label (Optional)
                        </label>
                        <Input
                            id="sourceLabel"
                            placeholder="e.g., 'Requirements Meeting - Jan 15'"
                            value={sourceLabel}
                            onChange={(e) => setSourceLabel(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium">
                            Content *
                        </label>
                        <Textarea
                            id="content"
                            placeholder="Paste your meeting notes, requirements, or any relevant information here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                            required
                        />
                        <div className="text-xs text-muted-foreground">
                            {content.length} characters
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={!content.trim() || submitMutation.isPending}
                        >
                            {submitMutation.isPending ? 'Adding...' : 'Add Text'}
                        </Button>
                        {content && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setContent('');
                                    setSourceLabel('');
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {submitMutation.isError && (
                        <div className="text-sm text-destructive">
                            Error: {(submitMutation.error as Error).message}
                        </div>
                    )}

                    {submitMutation.isSuccess && (
                        <div className="text-sm text-green-600">
                            ✓ Text added successfully
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
