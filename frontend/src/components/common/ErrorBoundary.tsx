import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                    <div className="max-w-md w-full space-y-4 text-center">
                        <div className="flex justify-center">
                            <div className="bg-destructive/10 p-4 rounded-full">
                                <AlertTriangle className="h-10 w-10 text-destructive" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
                        <p className="text-muted-foreground">
                            An unexpected error occurred. Our team has been notified.
                        </p>
                        <div className="bg-muted p-4 rounded-md text-left overflow-auto max-h-40 text-xs font-mono">
                            {this.state.error?.message}
                        </div>
                        <div className="flex gap-2 justify-center">
                            <Button onClick={() => window.location.reload()}>
                                Reload Page
                            </Button>
                            <Button variant="outline" onClick={() => window.location.href = '/'}>
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
