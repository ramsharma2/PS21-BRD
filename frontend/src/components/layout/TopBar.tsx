import { Bell, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../../contexts/AuthContext';

export default function TopBar() {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search projects..."
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>

                {/* User menu */}
                <div className="flex items-center gap-3">
                    {user?.picture && (
                        <img src={user.picture} alt="Avatar" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    )}
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{user?.name || 'User'}</div>
                        <div className="text-xs text-muted-foreground">
                            {user?.email}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
