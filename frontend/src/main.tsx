import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// Initialize React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
    console.warn('Missing Clerk publishable key. Running without authentication.');
}

// Render with or without Clerk based on key availability
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {clerkPubKey ? (
            <ClerkProvider publishableKey={clerkPubKey}>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </ClerkProvider>
        ) : (
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        )}
    </React.StrictMode>
);
