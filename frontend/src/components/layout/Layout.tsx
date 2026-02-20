import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';

export default function Layout() {
    const isSidebarOpen = useProjectStore((state) => state.isSidebarOpen);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className={cn('flex flex-1 flex-col transition-all duration-300', isSidebarOpen ? 'ml-64' : 'ml-16')}>
                {/* Top bar */}
                <TopBar />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
