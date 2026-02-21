import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
    const { login } = useAuth();

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to access your projects
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-8 pt-4">
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            if (credentialResponse.credential) {
                                login(credentialResponse.credential);
                            }
                        }}
                        onError={() => {
                            console.error('Login Failed');
                        }}
                        useOneTap
                    />
                </CardContent>
            </Card>
        </div>
    );
}
