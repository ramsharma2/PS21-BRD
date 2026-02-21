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
import { ArrowLeft, Download, FileText, Sparkles, Link as LinkIcon, Filter, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function Traceability() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentProject, setCurrentProject } = useProjectStore();
    const { toast } = useToast();
    const [isVisible, setIsVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSection, setFilterSection] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

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
        
        const filteredData = getFilteredData();
        
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Requirement,Source,Section,Priority,Status\n"
            + filteredData.map(e => `"${e.requirementId}","${e.requirement.replace(/"/g, '""')}","${e.sourceName}","${e.brdSection}","${e.priority}","${e.status}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rtm_${project?.name || 'export'}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: "Export Successful",
            description: `Exported ${filteredData.length} requirements to CSV`,
        });
    };

    const getFilteredData = () => {
        if (!rtmData) return [];
        
        return rtmData.filter(row => {
            const matchesSearch = searchQuery === '' || 
                row.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                row.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesSection = filterSection === 'all' || row.brdSection === filterSection;
            const matchesPriority = filterPriority === 'all' || row.priority.toLowerCase() === filterPriority.toLowerCase();
            
            return matchesSearch && matchesSection && matchesPriority;
        });
    };

    const filteredData = getFilteredData();
    const uniqueSections = Array.from(new Set(rtmData?.map(r => r.brdSection) || []));
    const uniquePriorities = Array.from(new Set(rtmData?.map(r => r.priority) || []));

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-8 relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-blob" style={{ top: '10%', left: '5%' }} />
                <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" style={{ top: '50%', right: '5%' }} />
            </div>

            <div className={`flex items-center justify-between transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div>
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(`/projects/${projectId}/brd`)} 
                        className="mb-2 hover:bg-blue-100 dark:hover:bg-blue-900 transform hover:scale-105 transition-all duration-300 group"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        Back to Editor
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 dark:from-slate-100 dark:via-purple-100 dark:to-blue-100 bg-clip-text text-transparent flex items-center gap-2">
                        <LinkIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        Requirement Traceability Matrix
                    </h1>
                    <p className="text-muted-foreground mt-1">{project?.name || 'Loading...'}</p>
                </div>
                <Button 
                    onClick={handleExport} 
                    disabled={!rtmData || rtmData.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                    <Download className="h-4 w-4 mr-2 group-hover:translate-y-1 transition-transform duration-300" />
                    Export CSV
                </Button>
            </div>

            {/* Stats Cards */}
            <div className={`grid gap-4 md:grid-cols-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            Total Requirements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors animate-countUp">
                            {rtmData?.length || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp animation-delay-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Filtered Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-500 animate-countUp">
                            {filteredData.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp animation-delay-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            Unique Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-500 animate-countUp">
                            {new Set(rtmData?.map(r => r.sourceId) || []).size}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group animate-fadeInUp animation-delay-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            BRD Sections
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-500 animate-countUp">
                            {uniqueSections.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Filters & Search
                    </CardTitle>
                    <CardDescription>Filter and search through requirements</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search requirements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                            />
                        </div>
                        <Select value={filterSection} onValueChange={setFilterSection}>
                            <SelectTrigger className="focus:ring-2 focus:ring-purple-500 transition-all duration-300">
                                <SelectValue placeholder="Filter by section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sections</SelectItem>
                                {uniqueSections.map(section => (
                                    <SelectItem key={section} value={section}>{section}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="focus:ring-2 focus:ring-purple-500 transition-all duration-300">
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                {uniquePriorities.map(priority => (
                                    <SelectItem key={priority} value={priority.toLowerCase()}>{priority}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* RTM Table */}
            <Card className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Traceability Matrix
                    </CardTitle>
                    <CardDescription>
                        Complete mapping of requirements to sources and BRD sections
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-4">
                                <div className="relative">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600/30 border-t-purple-600 mx-auto"></div>
                                    <Sparkles className="h-6 w-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <p className="text-muted-foreground font-medium">Loading traceability data...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                        <TableHead className="w-[35%] font-semibold">Requirement</TableHead>
                                        <TableHead className="font-semibold">Source</TableHead>
                                        <TableHead className="font-semibold">BRD Section</TableHead>
                                        <TableHead className="font-semibold">Priority</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData && filteredData.length > 0 ? (
                                        filteredData.map((row, index) => (
                                            <TableRow 
                                                key={row.requirementId}
                                                className="hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors duration-200 animate-fadeInUp"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="max-h-24 overflow-y-auto text-sm leading-relaxed">
                                                        {row.requirement}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 group">
                                                        <FileText className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                                                        <span className="truncate max-w-[150px] group-hover:text-purple-600 transition-colors" title={row.sourceName}>
                                                            {row.sourceName}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="transform hover:scale-110 transition-transform duration-300">
                                                        {row.brdSection}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant={row.priority.toLowerCase() === 'high' ? 'destructive' : row.priority.toLowerCase() === 'medium' ? 'default' : 'secondary'}
                                                        className="transform hover:scale-110 transition-transform duration-300"
                                                    >
                                                        {row.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="transform hover:scale-110 transition-transform duration-300">
                                                        {row.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 rounded-2xl flex items-center justify-center animate-bounce-slow">
                                                        <LinkIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <p className="text-muted-foreground font-medium">
                                                        {searchQuery || filterSection !== 'all' || filterPriority !== 'all' 
                                                            ? 'No requirements match your filters' 
                                                            : 'No requirements found to trace'}
                                                    </p>
                                                    {(searchQuery || filterSection !== 'all' || filterPriority !== 'all') && (
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => {
                                                                setSearchQuery('');
                                                                setFilterSection('all');
                                                                setFilterPriority('all');
                                                            }}
                                                            className="mt-2"
                                                        >
                                                            Clear Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
