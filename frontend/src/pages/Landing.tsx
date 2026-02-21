
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Zap, Shield, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
        setTimeout(() => setIsVisible(true), 100);
    }, [user, navigate]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSignIn = () => {
        navigate('/login');
    };

    const features = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Generate comprehensive BRDs in under 30 minutes, not weeks',
        },
        {
            icon: Shield,
            title: 'AI-Powered',
            description: 'Advanced AI filters noise and extracts only relevant requirements',
        },
        {
            icon: FileText,
            title: 'Multi-Source',
            description: 'Ingest from emails, Slack, documents, and meeting transcripts',
        },
        {
            icon: TrendingUp,
            title: 'Full Traceability',
            description: 'Every requirement linked to its source with complete citations',
        },
    ];

    const benefits = [
        'Reduce documentation time from weeks to minutes',
        'Eliminate manual consolidation errors',
        'Maintain complete requirement traceability',
        'Support multiple BRD templates',
        'Real-time collaboration and editing',
        'Automated conflict detection',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob"
                    style={{
                        top: '10%',
                        left: '10%',
                        transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />
                <div 
                    className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"
                    style={{
                        top: '60%',
                        right: '10%',
                        transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />
                <div 
                    className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"
                    style={{
                        bottom: '10%',
                        left: '50%',
                        transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 z-50 animate-slideDown">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                BRDify
                            </span>
                        </div>
                        <Button 
                            onClick={handleSignIn} 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Sign In with Google
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
                <div className={`max-w-7xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 animate-bounce-slow">
                        <Sparkles className="h-4 w-4 animate-spin-slow" />
                        AI-Powered Documentation
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="inline-block animate-fadeInUp bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                            Transform Scattered Ideas
                        </span>
                        <br />
                        <span className="inline-block animate-fadeInUp animation-delay-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 dark:from-blue-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                            Into Professional BRDs
                        </span>
                    </h1>
                    
                    <p className={`text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        Automate business requirements documentation with AI. 
                        Reduce weeks of manual work to just minutes.
                    </p>
                    
                    <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <Button 
                            size="lg" 
                            onClick={handleSignIn}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 group transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl animate-pulse-slow"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="text-lg px-8 py-6 transform hover:scale-105 transition-all duration-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Learn More
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className={`grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 animate-countUp">95%</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Time Saved</div>
                        </div>
                        <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300 animation-delay-200">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 animate-countUp">30min</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Avg. Generation</div>
                        </div>
                        <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300 animation-delay-400">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 animate-countUp">100%</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Traceable</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            Everything you need to create professional BRDs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer animate-fadeInUp"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-blue-500/50">
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-fadeInLeft">
                            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                                Why Choose BRDify?
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                                Stop wasting weeks on manual documentation. Let AI do the heavy lifting while you focus on strategy.
                            </p>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-start gap-3 animate-fadeInLeft hover:translate-x-2 transition-transform duration-300"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5 animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }} />
                                        <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative animate-fadeInRight">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-3xl opacity-20 animate-pulse-slow"></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl transform hover:scale-105 transition-all duration-500">
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-shimmer"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-shimmer" style={{ animationDelay: '200ms' }}></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-shimmer" style={{ animationDelay: '400ms' }}></div>
                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 animate-fadeIn">
                                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm font-medium">
                                            <Sparkles className="h-4 w-4 animate-spin-slow" />
                                            AI-Generated Content
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 animate-fadeInUp">
                    <h2 className="text-4xl font-bold mb-6 text-white">
                        Ready to Transform Your Documentation?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join teams who've reduced their BRD creation time by 95%
                    </p>
                    <Button 
                        size="lg"
                        onClick={handleSignIn}
                        className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 group transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-white/50"
                    >
                        Start Creating BRDs Now
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            BRDify
                        </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        © 2024 BRDify. AI-Powered Business Requirements Documentation.
                    </p>
                </div>
            </footer>
        </div>
    );
}
