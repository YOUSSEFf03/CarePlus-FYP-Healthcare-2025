import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export type SignupDraft = {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    dob?: string;                       // ISO string
    gender?: 'male' | 'female';
    history?: string;
};

type Ctx = {
    draft: SignupDraft;
    update: (patch: Partial<SignupDraft>) => void;
    reset: () => void;
};

const defaultDraft: SignupDraft = { fullName: '', phone: '', email: '' };

const SignupDraftContext = createContext<Ctx>({
    draft: defaultDraft,
    update: () => { },
    reset: () => { },
});

export function SignupDraftProvider({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState<SignupDraft>(defaultDraft);
    const update = useCallback((patch: Partial<SignupDraft>) => {
        setDraft(prev => ({ ...prev, ...patch }));
    }, []);
    const reset = useCallback(() => setDraft(defaultDraft), []);

    const value = useMemo(() => ({ draft, update, reset }), [draft, update, reset]);

    return (
        <SignupDraftContext.Provider value={value}>{children}</SignupDraftContext.Provider>
    );
}

export const useSignupDraft = () => useContext(SignupDraftContext);
