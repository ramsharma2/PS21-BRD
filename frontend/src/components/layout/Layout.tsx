import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';

export default function Layout() {
    const isSidebarOpen = useProjectStore((state) => state.isSidebarOpen);

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className={cn('flex flex-1 flex-col transition-all duration-300', isSidebarOpen ? 'ml-64' : 'ml-16')}>
                {/* Top bar */}
                <TopBar />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
