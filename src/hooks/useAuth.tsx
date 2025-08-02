
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { firstName: string; lastName: string; shopName: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Vérifier immédiatement la session existante
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Ne plus définir loading à false ici pour éviter les clignotements
          if (event === 'INITIAL_SESSION') {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error('Erreur de connexion: ' + error.message);
        return { error };
      }

      // Pas besoin de gérer manuellement setUser/setSession ici
      // L'événement onAuthStateChange le fera automatiquement
      toast.success('Connexion réussie !');
      return { error: null };
      
    } catch (error: any) {
      console.error('Sign in catch error:', error);
      toast.error('Une erreur inattendue s\'est produite');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { firstName: string; lastName: string; shopName: string }) => {
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            shopName: userData.shopName,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error('Erreur lors de l\'inscription: ' + error.message);
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
      } else {
        toast.success('Compte créé avec succès !');
      }
      
      return { error: null };
      
    } catch (error: any) {
      console.error('Sign up catch error:', error);
      toast.error('Une erreur inattendue s\'est produite');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Erreur lors de la déconnexion');
        return;
      }

      // Nettoyer manuellement l'état pour éviter les délais
      setUser(null);
      setSession(null);
      toast.success('Déconnexion réussie');
      
    } catch (error) {
      console.error('Sign out catch error:', error);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    } 
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
