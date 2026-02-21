import { UserButton, useUser } from '@clerk/clerk-react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TopBar() {
    const { user } = useUser();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-6 shadow-sm">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3 mr-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        BRDify
                    </h1>
                    <p className="text-[10px] text-muted-foreground -mt-0.5">AI-Powered Documentation</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search projects, documents, requirements..."
                        className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-950 transition-colors"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-950"></span>
                </Button>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>

                {/* User menu */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden lg:block">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.fullName || 'User'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {user?.primaryEmailAddress?.emailAddress}
                        </div>
                    </div>
                    <div className="ring-2 ring-gray-200 dark:ring-gray-800 rounded-full">
                        <UserButton 
                            afterSignOutUrl="/sign-in"
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9"
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
