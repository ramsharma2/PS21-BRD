import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { toast } = useToast();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome to BRDify
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to continue to your AI-powered documentation
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                if (credentialResponse.credential) {
                                    login(credentialResponse.credential);
                                    toast({
                                        title: "Success",
                                        description: "Successfully logged in",
                                    });
                                    navigate('/');
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
            </div>
        </div>
    );
}
