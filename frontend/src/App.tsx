import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';
import { Toaster } from './components/ui/toaster';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewProject = lazy(() => import('./pages/NewProject'));
const DataIngestion = lazy(() => import('./pages/DataIngestion'));
const DatasetImport = lazy(() => import('./pages/DatasetImport'));
const BRDEditor = lazy(() => import('./pages/BRDEditor'));
const Conflicts = lazy(() => import('./pages/Conflicts'));
const Traceability = lazy(() => import('./pages/Traceability'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            {/* Auth routes */}
                            <Route path="/login" element={<Login />} />

                            {/* Protected routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route element={<Layout />}>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/projects/new" element={<NewProject />} />
                                    <Route path="/projects/:projectId/ingest" element={<DataIngestion />} />
                                    <Route path="/projects/:projectId/dataset-import" element={<DatasetImport />} />
                                    <Route path="/projects/:projectId/brd" element={<BRDEditor />} />
                                    <Route path="/projects/:projectId/conflicts" element={<Conflicts />} />
                                    <Route path="/projects/:projectId/traceability" element={<Traceability />} />
                                    <Route path="/projects/:projectId/analytics" element={<Analytics />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Route>
                            </Route>

                            {/* Catch all */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                    <Toaster />
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

/**
 * Protected route wrapper that requires authentication
 */
function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Layout />;
}

export default App;
