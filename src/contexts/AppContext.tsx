
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  shopName?: string;
  avatar?: string;
}

interface AppState {
  user: User | null;
  language: Language;
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  isMobile: boolean;
}

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (user: User) => void;
  logout: () => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, session } = useAuth();
  const [state, setState] = useState<AppState>({
    user: null,
    language: 'fr',
    theme: 'light',
    isAuthenticated: false,
    isMobile: false,
  });

  // Charger le profil utilisateur depuis Supabase
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        return;
      }

      if (profile && authUser) {
        const userData: User = {
          id: profile.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: authUser.email || '',
          phone: profile.phone || undefined,
          shopName: profile.shop_name || undefined,
          avatar: profile.avatar_url || undefined,
        };

        setState(prev => ({ 
          ...prev, 
          user: userData, 
          isAuthenticated: true 
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  // Écouter les changements d'authentification
  useEffect(() => {
    if (authUser && session) {
      loadUserProfile(authUser.id);
    } else {
      setState(prev => ({ 
        ...prev, 
        user: null, 
        isAuthenticated: false 
      }));
    }
  }, [authUser, session]);

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedLanguage = localStorage.getItem('miabe-language') as Language;
    const savedTheme = localStorage.getItem('miabe-theme') as 'light' | 'dark';

    if (savedLanguage) {
      setState(prev => ({ ...prev, language: savedLanguage }));
    }

    if (savedTheme) {
      setState(prev => ({ ...prev, theme: savedTheme }));
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user, isAuthenticated: !!user }));
  };

  const setLanguage = (language: Language) => {
    setState(prev => ({ ...prev, language }));
    localStorage.setItem('miabe-language', language);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
    localStorage.setItem('miabe-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  const login = (user: User) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: AppContextType = {
    ...state,
    setUser,
    setLanguage,
    setTheme,
    login,
    logout,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
