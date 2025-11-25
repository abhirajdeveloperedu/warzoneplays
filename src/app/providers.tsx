"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  coins: number;
  created_at: string;
  stats: {
    matches_played: number;
    wins: number;
    win_rate: number;
    kd_ratio: number;
  };
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple profile fetch
  async function fetchProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      return data;
    } catch {
      return null;
    }
  }

  // Refresh profile
  async function refreshProfile() {
    if (user) {
      const data = await fetchProfile(user.id);
      if (data) setProfile(data);
    }
  }

  // Sign in
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.user) {
      setUser(data.user);
      const profileData = await fetchProfile(data.user.id);
      if (profileData) setProfile(profileData);
    }
    return { error: error as Error | null };
  }

  // Sign up
  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (data.user) {
      setUser(data.user);
      const profileData = await fetchProfile(data.user.id);
      if (profileData) setProfile(profileData);
    }
    return { error: error as Error | null };
  }

  // Sign out
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  // Initialize auth on mount
  useEffect(() => {
    // Check session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).then(data => {
          if (data) setProfile(data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).then(data => {
          if (data) setProfile(data);
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
