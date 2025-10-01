import React, { createContext, useContext, useState } from "react";

export type Sex = "male" | "female" | "unknown";
export type User = {
    id: string;
    name: string;
    age: number;
    sex: Sex;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
    medicalHistory?: string;
    role?: string;
};

type Ctx = {
    user: User | null;
    setUser: (u: User | null) => void;
};

const UserContext = createContext<Ctx>({ user: null, setUser: () => { } });

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
    return useContext(UserContext);
}