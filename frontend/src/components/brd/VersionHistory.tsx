import { formatRelativeTime } from '@/lib/utils';
import type { BRDVersion } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RotateCcw, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VersionHistoryProps {
    versions: BRDVersion[];
    currentVersion: number;
    onRollback: (version: BRDVersion) => void;
    isRollingBack: boolean;
}

export default function VersionHistory({
    versions,
    currentVersion,
    onRollback,
    isRollingBack
}: VersionHistoryProps) {

    if (versions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                No history available
            </div>
        );
    }

    return (
        <ScrollArea className="h-[300px] w-full rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Ver</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {versions.map((version) => (
                        <TableRow key={version.id} className={version.versionNumber === currentVersion ? "bg-muted/50" : ""}>
                            <TableCell className="font-medium">v{version.versionNumber}</TableCell>
                            <TableCell>{version.changeLog}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {formatRelativeTime(version.createdAt)}
                            </TableCell>
                            <TableCell>
                                {version.versionNumber !== currentVersion && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRollback(version)}
                                        disabled={isRollingBack}
                                        title="Rollback to this version"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                )}
                                {version.versionNumber === currentVersion && (
                                    <span className="text-xs font-medium text-primary">Current</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}
