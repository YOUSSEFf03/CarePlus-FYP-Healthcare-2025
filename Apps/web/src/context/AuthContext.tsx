import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'doctor' | 'assistant' | 'pharmacy';

interface AuthUser {
    sub: string;
    name: string;
    email: string;
    role: Role;
    specialty?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // const [user, setUser] = useState<{ role: Role } | null>(null);
    const [user, setUser] = useState<AuthUser | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) as AuthUser : null;
    });

    const login = (user: AuthUser) => {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);