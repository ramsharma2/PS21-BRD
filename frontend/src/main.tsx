import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

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

// Get Google client ID from environment
// @ts-ignore
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
    console.warn('Missing Google Client ID. Authentication will not work.');
}

// Render with Google OAuth
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
                <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                        <App />
                    </QueryClientProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        ) : (
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        )}
    </React.StrictMode>
);
