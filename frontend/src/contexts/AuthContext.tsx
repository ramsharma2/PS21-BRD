import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    email: string;
    name: string;
    picture: string;
    sub: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            try {
                const decodedToken = jwtDecode<User>(storedToken);

                // Optional: Check if token is expired
                const isExpired = (jwtDecode(storedToken) as any).exp * 1000 < Date.now();
                if (isExpired) {
                    throw new Error('Token expired');
                }

                setToken(storedToken);
                setUser({
                    email: decodedToken.email,
                    name: decodedToken.name,
                    picture: decodedToken.picture,
                    sub: decodedToken.sub
                });

                // Expose to window for API client like before
                // @ts-ignore
                window.__GET_TOKEN__ = () => storedToken;

            } catch (error) {
                console.error('Failed to parse stored token', error);
                localStorage.removeItem('auth_token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem('auth_token', newToken);
        const decodedToken = jwtDecode<User>(newToken);

        setToken(newToken);
        setUser({
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture,
            sub: decodedToken.sub
        });

        // Expose to window for API client
        // @ts-ignore
        window.__GET_TOKEN__ = () => newToken;
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        // @ts-ignore
        window.__GET_TOKEN__ = undefined;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
