import React, { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos';
import { AppAbility } from '@/lib/ability';

export const AbilityContext = createContext<AppAbility>(undefined as any);
export const Can = createContextualCan(AbilityContext.Consumer);

interface AbilityProviderProps {
    children: React.ReactNode;
}

export function AbilityProvider({ children }: AbilityProviderProps) {
    const { ability, loading } = usePermisosDinamicos();

    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    );
}
