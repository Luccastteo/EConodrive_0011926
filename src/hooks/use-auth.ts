import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Mock user for demo mode when Supabase is not configured
const mockUser: User = {
  id: 'demo-user-id',
  email: 'demo@econodrive.com',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: { name: 'Usuário Demo' },
  created_at: new Date().toISOString(),
} as any;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

    const isDemoMode = !supabaseUrl || !supabaseKey ||
      supabaseKey.includes('your_') ||
      supabaseKey === '' ||
      supabaseUrl === '';

    if (isDemoMode) {
      // Check if user explicitly logged out in demo mode
      const hasLoggedOut = localStorage.getItem('econodrive_demo_logged_out');
      if (hasLoggedOut) {
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      // Use demo mode
      setUser(mockUser);
      setSession({ user: mockUser, access_token: 'demo-token', refresh_token: 'demo-refresh' } as any);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check if demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

    const isDemoMode = !supabaseUrl || !supabaseKey ||
      supabaseKey.includes('your_') ||
      supabaseKey === '' ||
      supabaseUrl === '';

    if (isDemoMode) {
      // Mock successful login
      localStorage.removeItem('econodrive_demo_logged_out');
      setUser(mockUser);
      setSession({ user: mockUser, access_token: 'demo-token', refresh_token: 'demo-refresh' } as any);
      return { user: mockUser, session: { user: mockUser, access_token: 'demo-token', refresh_token: 'demo-refresh' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string) => {
    // Check if demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

    const isDemoMode = !supabaseUrl || !supabaseKey ||
      supabaseKey.includes('your_') ||
      supabaseKey === '' ||
      supabaseUrl === '';

    if (isDemoMode) {
      // Mock successful signup
      localStorage.removeItem('econodrive_demo_logged_out');
      setUser(mockUser);
      setSession({ user: mockUser, access_token: 'demo-token', refresh_token: 'demo-refresh' } as any);
      return { user: mockUser, session: { user: mockUser, access_token: 'demo-token', refresh_token: 'demo-refresh' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    // Check if demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

    const isDemoMode = !supabaseUrl || !supabaseKey ||
      supabaseKey.includes('your_') ||
      supabaseKey === '' ||
      supabaseUrl === '';

    if (isDemoMode) {
      // Mock sign out
      localStorage.setItem('econodrive_demo_logged_out', 'true');
      setUser(null);
      setSession(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
}
