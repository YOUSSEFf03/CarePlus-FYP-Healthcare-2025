import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'doctor' | 'assistant' | 'pharmacy';

interface AuthContextType {
    isAuthenticated: boolean;
    user: {
        role: Role;
    } | null;
    login: (role: Role) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ role: Role } | null>(null);

    const login = (role: Role) => {
        setUser({ role });
    };

    const logout = () => {
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);