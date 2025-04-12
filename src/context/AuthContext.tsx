import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type UserRole = "volunteer" | "organization" | "sponsor" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points?: number;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  created_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  register: (userData: RegisterData, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  [key: string]: any; // For additional fields based on role
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlock with Supabase client
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession?.user?.id);
        setSession(currentSession);

        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      if (data) {
        console.log("Profile loaded:", data);
        setUser(data as UserProfile);
      } else {
        console.warn("No profile found for user:", userId);
        setUser(null);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    setIsLoading(true);
    
    try {
      console.log("Login attempt for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Supabase login error:", error);
        throw error;
      }

      console.log("Login successful, user:", data.user?.id);
      // User and session will be set by the onAuthStateChange listener
      toast.success("Successfully logged in!");
      
      // Return the user profile so the login component can access the role
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        return profileData as UserProfile;
      }
      
      return null;
    } catch (error: any) {
      console.error("Login error details:", error);
      toast.error(error.message || "Failed to log in");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData, role: UserRole) => {
    setIsLoading(true);
    
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: role,
            // Include any other metadata needed
          }
        }
      });

      if (authError) {
        throw authError;
      }

      toast.success("Registration successful! Please check your email for verification.");
      
      // Note: The profile will be created automatically via database trigger
      // defined in the SQL migration
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // The user state will be cleared by the onAuthStateChange listener
      toast.success("Successfully logged out");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to log out");
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user || !user.id) {
      toast.error("You must be logged in to update your profile");
      return Promise.reject("User not authenticated");
    }

    setIsLoading(true);
    
    try {
      // Use type assertion to tell TypeScript that this is a valid table
      const { error } = await supabase
        .from('profiles' as any)
        .update(profileData as any)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Refresh user data
      await fetchUserProfile(user.id);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
