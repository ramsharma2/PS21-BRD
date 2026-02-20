import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface Citation {
    sourceId: string;
    chunkId: string;
    text: string;
    metadata?: {
        filename?: string;
        sourceLabel?: string;
        page?: number;
        timestamp?: string;
    };
}

interface CitationViewerProps {
    citations: Citation[];
    onClose?: () => void;
}

export default function CitationViewer({ citations, onClose }: CitationViewerProps) {
    const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
        citations.length > 0 ? citations[0] : null
    );

    if (citations.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No citations available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Citations ({citations.length})
                    </CardTitle>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Citation list */}
                <div className="space-y-2">
                    {citations.map((citation, index) => {
                        const label =
                            citation.metadata?.sourceLabel ||
                            citation.metadata?.filename ||
                            `Source ${index + 1}`;
                        const isSelected = selectedCitation?.chunkId === citation.chunkId;

                        return (
                            <button
                                key={citation.chunkId}
                                onClick={() => setSelectedCitation(citation)}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${isSelected
                                        ? 'bg-primary/10 border-primary'
                                        : 'hover:bg-accent border-transparent'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{label}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {citation.metadata?.page && `Page ${citation.metadata.page} • `}
                                            {citation.metadata?.timestamp &&
                                                formatRelativeTime(citation.metadata.timestamp)}
                                        </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Selected citation detail */}
                {selectedCitation && (
                    <div className="border-t pt-4">
                        <div className="text-sm font-medium mb-2">Source Text</div>
                        <div className="bg-muted p-4 rounded-lg text-sm">
                            <p className="text-muted-foreground italic">&quot;{selectedCitation.text}&quot;</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
