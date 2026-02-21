import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { toast } = useToast();
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob"
                    style={{
                        top: '20%',
                        left: '10%',
                        transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />
                <div 
                    className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"
                    style={{
                        bottom: '20%',
                        right: '10%',
                        transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />
                <div 
                    className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />
            </div>

            {/* Back to home button */}
            <Button
                variant="ghost"
                className="fixed top-4 left-4 z-50 group animate-slideDown"
                onClick={() => navigate('/')}
            >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Home
            </Button>

            <div className={`w-full max-w-md space-y-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-10 shadow-2xl border border-gray-200 dark:border-gray-800 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                {/* Decorative gradient border effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>
                
                <div className="text-center animate-fadeInUp">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl mb-6 transform hover:rotate-12 hover:scale-110 transition-all duration-500 group">
                        <FileText className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                        <Sparkles className="h-5 w-5 text-white absolute -top-1 -right-1 animate-spin-slow" />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-3">
                        Welcome to BRDify
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Sign in to continue to your AI-powered documentation
                    </p>
                </div>

                <div className={`mt-8 space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Feature highlights */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all duration-300 cursor-pointer">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">95%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Faster</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 transform hover:scale-105 transition-all duration-300 cursor-pointer animation-delay-200">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">30min</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 transform hover:scale-105 transition-all duration-300 cursor-pointer animation-delay-400">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">100%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Traceable</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                            <div className="relative bg-white dark:bg-gray-900 rounded-full p-1">
                                <GoogleLogin
                                    onSuccess={(credentialResponse) => {
                                        if (credentialResponse.credential) {
                                            login(credentialResponse.credential);
                                            toast({
                                                title: "Success",
                                                description: "Successfully logged in",
                                            });
                                            navigate('/dashboard');
                                        }
                                    }}
                                    onError={() => {
                                        toast({
                                            title: "Error",
                                            description: "Failed to login with Google",
                                            variant: "destructive",
                                        });
                                    }}
                                    useOneTap
                                    theme="filled_blue"
                                    shape="pill"
                                    size="large"
                                />
                            </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-500 text-center max-w-xs">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>

                    {/* Benefits list */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">What you'll get:</p>
                        <div className="space-y-2">
                            {[
                                'AI-powered BRD generation',
                                'Multi-source data ingestion',
                                'Complete requirement traceability',
                                'Real-time collaboration'
                            ].map((benefit, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 animate-fadeInLeft hover:translate-x-2 transition-transform duration-300"
                                    style={{ animationDelay: `${(index + 5) * 100}ms` }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse-slow"></div>
                                    {benefit}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-2xl opacity-20 animate-pulse-slow"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
            </div>
        </div>
    );
}
