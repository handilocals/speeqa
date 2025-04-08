import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string;
  cover_image: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data with retry logic
  const fetchProfile = async (
    userId: string,
    retryCount = 0,
    maxRetries = 3,
  ) => {
    try {
      console.log("Fetching profile for user ID:", userId);

      // First check if the profile exists
      const { data: profileExists, error: countError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      console.log("Profile existence check:", {
        profileExists,
        error: countError,
      });

      // If profile doesn't exist, create it
      if (!countError && !profileExists) {
        console.log("Profile doesn't exist, creating default profile");

        const defaultProfile = {
          id: userId,
          username: `user_${Math.floor(Math.random() * 10000)}`,
          avatar_url: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("profiles")
          .insert(defaultProfile);

        if (insertError) {
          console.error("Error creating profile:", insertError);
          // If we can't create the profile, set a default one in memory
          setProfile({
            id: userId,
            username: `user_${Math.floor(Math.random() * 10000)}`,
            full_name: null,
            avatar_url: "",
            cover_image: null,
            bio: null,
            website: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          return;
        }
      }

      // Now fetch the profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("Profile fetch response:", { data, error });

      if (error) {
        if (retryCount < maxRetries) {
          // Exponential backoff: wait longer between each retry
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(
            `Retrying profile fetch in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`,
          );
          setTimeout(
            () => fetchProfile(userId, retryCount + 1, maxRetries),
            delay,
          );
          return;
        }
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // If we still don't have data, set a default profile
        setProfile({
          id: userId,
          username: `user_${Math.floor(Math.random() * 10000)}`,
          full_name: null,
          avatar_url: "",
          cover_image: null,
          bio: null,
          website: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // If we still don't have a profile after all retries, set a default one
      if (!profile) {
        setProfile({
          id: userId,
          username: `user_${Math.floor(Math.random() * 10000)}`,
          full_name: null,
          avatar_url: "",
          cover_image: null,
          bio: null,
          website: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  };

  useEffect(() => {
    // Check active sessions and set the user
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          // Set loading to false even if there's no session
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error getting session:", error);
        setLoading(false);
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
