import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText } from 'lucide-react';

interface CitationBadgeProps {
    citationNumber: number;
    sourceLabel?: string;
    excerpt?: string;
}

export default function CitationBadge({ citationNumber, sourceLabel, excerpt }: CitationBadgeProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <sup className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-medium cursor-help ml-1 hover:bg-primary/30 transition-colors">
                        {citationNumber}
                    </sup>
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
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
