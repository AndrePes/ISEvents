import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUpProvider: (
    email: string,
    password: string,
    profile: {
      name: string;
      phone: string;
      street: string;
      city: string;
      cityCode: string;
    }
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("Supabase session could not be loaded:", error.message);
      }
      setSession(data.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const supabase = getSupabaseClient();

    return {
      session,
      user: session?.user ?? null,
      loading,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }
      },
      async signUpProvider(email, password, profile) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              provider_name: profile.name,
              provider_phone: profile.phone,
              provider_street: profile.street,
              provider_city: profile.city,
              provider_city_code: profile.cityCode,
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        const userId = data.user?.id;

        if (!userId) {
          throw new Error("Registrierung fehlgeschlagen. Bitte erneut versuchen.");
        }

        if (data.session) {
          const { error: providerError } = await supabase.from("Provider").upsert({
            id: userId,
            email,
            name: profile.name,
            phone: profile.phone,
            street: profile.street,
            city: profile.city,
            cityCode: profile.cityCode,
          });

          if (providerError) {
            throw new Error(providerError.message);
          }
        }

        return { needsEmailConfirmation: !data.session };
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw new Error(error.message);
        }
      },
    };
  }, [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
