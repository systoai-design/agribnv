import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  username: string | null;
}

type ViewMode = 'guest' | 'host';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isHost: boolean;
  viewMode: ViewMode;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName?: string, username?: string, phone?: string) => Promise<{ data?: any; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  becomeHost: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  switchViewMode: (mode: ViewMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('agribnv_viewMode');
    return (saved === 'host' || saved === 'guest') ? saved : 'guest';
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string, currentUser?: User | null, retries = 3): Promise<void> => {
    const fallbackUser = currentUser || user;
    for (let i = 0; i < retries; i++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.warn(`fetchProfile error (attempt ${i + 1}):`, error);
      }

      if (data) {
        setProfile({
          ...data,
          full_name: data.full_name || fallbackUser?.user_metadata?.full_name || null,
          username: data.username || fallbackUser?.user_metadata?.username || fallbackUser?.email?.split('@')[0] || null,
          phone: data.phone || fallbackUser?.user_metadata?.phone || null,
          avatar_url: data.avatar_url || fallbackUser?.user_metadata?.avatar_url || null,
        });
        return;
      }

      // Wait 500ms before retrying if trigger hasn't finished
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Fallback if no profiles row exists yet
    if (fallbackUser) {
      setProfile({
        id: userId,
        full_name: fallbackUser.user_metadata?.full_name || null,
        username: fallbackUser.user_metadata?.username || fallbackUser.email?.split('@')[0] || null,
        phone: fallbackUser.user_metadata?.phone || null,
        avatar_url: fallbackUser.user_metadata?.avatar_url || null,
        bio: null,
      });
    }
  };

  const checkHostStatus = async (userId: string): Promise<void> => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'host')
      .maybeSingle();
    
    const hostStatus = !!data;
    setIsHost(hostStatus);
    
    // Auto-set view mode to host if user is a host and hasn't explicitly saved a preference
    const savedMode = localStorage.getItem('agribnv_viewMode');
    if (hostStatus && !savedMode) {
      setViewMode('host');
      localStorage.setItem('agribnv_viewMode', 'host');
    }
  };

  const switchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('agribnv_viewMode', mode);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
      await checkHostStatus(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Listener for ONGOING auth changes (does NOT control isLoading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);
        
        // Fire and forget for ongoing changes - don't await, don't set loading
        if (currentUser) {
          fetchProfile(currentUser.id, currentUser);
          checkHostStatus(currentUser.id);
        } else {
          setProfile(null);
          setIsHost(false);
          setViewMode('guest');
          localStorage.removeItem('agribnv_viewMode');
        }
      }
    );

    // INITIAL load - controls isLoading, awaits role check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);

        // Await role check BEFORE setting loading false
        if (currentUser) {
          await Promise.all([
            fetchProfile(currentUser.id, currentUser),
            checkHostStatus(currentUser.id)
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, username?: string, phone?: string) => {
    const redirectUrl = `${window.location.origin}/explore`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
          username: username || '',
          phone: phone || '',
        },
      },
    });

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsHost(false);
    setViewMode('guest');
    localStorage.removeItem('agribnv_viewMode');
  };

  const becomeHost = async () => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    // First check if user already has host role
    const { data: existingRole, error: selectError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'host')
      .maybeSingle();

    if (existingRole) {
      // Already a host, just update state and return success
      setIsHost(true);
      setViewMode('host');
      return { error: null };
    }

    // Insert new host role
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'host' });

    if (error) {
      // If error is duplicate key (23505), they are already a host. Treat as success.
      if (error.code === '23505') {
        setIsHost(true);
        setViewMode('host');
        return { error: null };
      }
      return { error: new Error(error.message) };
    }

    if (!error) {
      setIsHost(true);
      setViewMode('host');
      localStorage.setItem('agribnv_viewMode', 'host');
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isHost,
        viewMode,
        isLoading,
        signUp,
        signIn,
        signOut,
        becomeHost,
        refreshProfile,
        switchViewMode,
      }}
    >
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
