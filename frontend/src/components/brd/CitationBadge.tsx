import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText } from 'lucide-react';

interface CitationBadgeProps {
    citationNumber: number;
    sourceLabel?: string;
    excerpt?: string;
    onClick?: () => void;
}

export default function CitationBadge({ citationNumber, sourceLabel, excerpt, onClick }: CitationBadgeProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onClick}
                        className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium cursor-pointer ml-1 hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                    >
                        {citationNumber}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">{sourceLabel || `Source ${citationNumber}`}</span>
                        </div>
                        {excerpt && (
                            <p className="text-xs text-muted-foreground italic">
                                &quot;{excerpt.substring(0, 100)}
                                {excerpt.length > 100 ? '...' : ''}&quot;
                            </p>
                        )}
                        <p className="text-xs text-blue-400">Click to view full source</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
