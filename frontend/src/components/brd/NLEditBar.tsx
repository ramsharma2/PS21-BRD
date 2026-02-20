import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Send } from 'lucide-react';

interface NLEditBarProps {
    onEdit: (instruction: string) => Promise<void>;
    isProcessing: boolean;
    disabled?: boolean;
}

export default function NLEditBar({ onEdit, isProcessing, disabled }: NLEditBarProps) {
    const [instruction, setInstruction] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instruction.trim() || isProcessing) return;

        await onEdit(instruction);
        setInstruction('');
    };

    return (
        <div className="bg-muted/50 border rounded-lg p-2 shadow-sm mb-6">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <div className="bg-primary/10 p-2 rounded-full">
                    <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <Input
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Ask AI to edit the document (e.g., 'Make the tone more professional', 'Add a requirement for OAuth')"
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none flex-1"
                    disabled={disabled || isProcessing}
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={disabled || isProcessing || !instruction.trim()}
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}
