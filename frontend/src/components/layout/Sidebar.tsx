import { Link, useLocation } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FolderPlus,
    FileText,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'New Project', href: '/projects/new', icon: FolderPlus },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const location = useLocation();
    const { isSidebarOpen, toggleSidebar, currentProject } = useProjectStore();

    // Project-specific navigation (shown when a project is selected)
    const projectNavigation = currentProject
        ? [
            {
                name: 'Data Ingestion',
                href: `/projects/${currentProject.id}/ingest`,
                icon: FileText,
            },
            {
                name: 'BRD Editor',
                href: `/projects/${currentProject.id}/brd`,
                icon: FileText,
            },
            {
                name: 'Conflict Detection',
                href: `/projects/${currentProject.id}/conflicts`,
                icon: AlertTriangle,
            },
            {
                name: 'Traceability (RTM)',
                href: `/projects/${currentProject.id}/traceability`,
                icon: LinkIcon,
            },
            {
                name: 'Analytics',
                href: `/projects/${currentProject.id}/analytics`,
                icon: BarChart3,
            },
        ]
        : [];

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300',
                isSidebarOpen ? 'w-64' : 'w-16'
            )}
        >
            {/* Logo and toggle */}
            <div className="flex h-16 items-center justify-between border-b px-4">
                {isSidebarOpen && (
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-md">
                            B
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">BRDify</span>
                    </Link>
                )}
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
                    {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
                {/* Main navigation */}
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                            title={!isSidebarOpen ? item.name : undefined}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {isSidebarOpen && <span>{item.name}</span>}
                        </Link>
                    );
                })}

                {/* Project navigation */}
                {projectNavigation.length > 0 && (
                    <>
                        {isSidebarOpen && (
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                                Current Project
                            </div>
                        )}
                        {projectNavigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    )}
                                    title={!isSidebarOpen ? item.name : undefined}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    {isSidebarOpen && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Current project info */}
            {isSidebarOpen && currentProject && (
                <div className="border-t p-4">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Active Project</div>
                    <div className="text-sm font-semibold truncate">{currentProject.name}</div>
                    <div className={cn('text-xs mt-1 px-2 py-0.5 rounded-full inline-block', getStatusColor(currentProject.status))}>
                        {currentProject.status}
                    </div>
                </div>
            )}
        </aside>
    );
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800',
        ingesting: 'bg-blue-100 text-blue-800',
        processing: 'bg-yellow-100 text-yellow-800',
        ready: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.draft;
}
