import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from './supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];

export interface AuthUser extends User {
  profile?: UserProfile;
}

export class AuthService {
  static async signUp(email: string, password: string, userData: {
    company_name: string;
    nif_cif: string;
    phone: string;
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Crear perfil de usuario
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          email,
          role: 'EMPRESA',
          company_name: userData.company_name,
          nif_cif: userData.nif_cif,
          phone: userData.phone,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Crear wallet de créditos
      if (userProfile) {
        await supabase
          .from('credit_wallets')
          .insert({
            user_id: userProfile.id,
            balance: 0,
          });
      }
    }

    return authData;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    // Primero, obtenemos la sesión. Esto nos da el usuario autenticado.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return null;
    }

    const user = session.user;

    // Luego, obtenemos el perfil de nuestra tabla 'users' pública.
    // La política RLS que creamos antes asegura que esto no falle.
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError.message);
      // Si el perfil no se encuentra, cerramos la sesión para evitar inconsistencias.
      await this.signOut();
      return null;
    }

    return {
      ...user,
      profile: profile || undefined,
    };
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  }

  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }
}
