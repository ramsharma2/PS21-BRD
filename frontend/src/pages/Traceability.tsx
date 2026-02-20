import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { exportRTMToExcel } from '@/services/exportService';

export default function Traceability() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, setCurrentProject } = useProjectStore();

    // Fetch project
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => api.getProject(projectId!),
        enabled: !!projectId,
    });

    // Update current project
    if (project && (!currentProject || currentProject.id !== project.id)) {
        setCurrentProject(project);
    }

    // Fetch RTM data
    const { data: rtmData, isLoading } = useQuery({
        queryKey: ['rtm', projectId],
        queryFn: () => api.getRTM(projectId!),
        enabled: !!projectId,
    });

    if (!projectId) return <div>Project not found</div>;

    const handleExport = () => {
        // Simple CSV export logic
        if (!rtmData) return;
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Requirement,Source,Section,Priority,Status\n"
            + rtmData.map(e => `"${e.requirementId}","${e.requirement.replace(/"/g, '""')}","${e.sourceName}","${e.brdSection}","${e.priority}","${e.status}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "rtm_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/brd`)} className="mb-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Editor
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Requirement Traceability Matrix (RTM)</h1>
                    <p className="text-muted-foreground mt-1">{project?.name || 'Loading...'}</p>
                </div>
                <Button onClick={handleExport} disabled={!rtmData || rtmData.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Traceability Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Requirement</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>BRD Section</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rtmData && rtmData.length > 0 ? (
                                    rtmData.map((row) => (
                                        <TableRow key={row.requirementId}>
                                            <TableCell className="font-medium">
                                                <div className="max-h-24 overflow-y-auto text-sm">
                                                    {row.requirement}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="truncate max-w-[150px]" title={row.sourceName}>
                                                        {row.sourceName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{row.brdSection}</TableCell>
                                            <TableCell>
                                                <Badge variant={row.priority === 'high' ? 'destructive' : 'secondary'}>
                                                    {row.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{row.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No requirements found to trace.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
