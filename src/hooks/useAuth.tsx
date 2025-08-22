import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AuthService, type AuthUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- INICIO: Lógica a prueba de fallos ---

    // Temporizador de seguridad por si Supabase no responde
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Auth timeout: Supabase no respondió a tiempo.");
        setLoading(false);
      }
    }, 5000); // 5 segundos de espera máxima

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        const currentUser = session ? await AuthService.getCurrentUser() : null;
        setUser(currentUser);
      } catch (error) {
        console.error("Error al refrescar la sesión:", error);
        setUser(null);
      } finally {
        // Cuando onAuthStateChange responde, cancelamos el temporizador y finalizamos la carga.
        clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    // --- FIN: Lógica a prueba de fallos ---

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn: AuthService.signIn,
    signOut: async () => {
      await AuthService.signOut();
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
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
