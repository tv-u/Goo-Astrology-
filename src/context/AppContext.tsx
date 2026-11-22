import React, { createContext, useContext, useEffect, useState } from 'react';
import type { KundliResult } from '../engine/ephemeris';
import {
  LOCALE_STRINGS,
  SUPPORTED_LANGUAGES,
  type IndianLanguageCode,
  type LocaleDictionary,
} from '../data/locales';

export type Language = IndianLanguageCode;
export type Theme = 'light' | 'dark';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: 'user' | 'astrologer' | 'admin';
  preferredLanguage: string;
}

interface AppContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  locale: LocaleDictionary;
  theme: Theme;
  toggleTheme: () => void;
  user: AuthUser | null;
  token: string | null;
  loginSession: (token: string, user: AuthUser) => void;
  logoutSession: () => void;
  activeKundli: KundliResult | null;
  setActiveKundli: (k: KundliResult | null) => void;
  geminiConfigured: boolean;
  rtcConfigured: boolean;
  t: (en: string, hi: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

function detectInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param && SUPPORTED_LANGUAGES.some((l) => l.code === param)) {
      return param as Language;
    }
  }
  return 'en';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(detectInitialLanguage);
  // Default theme is White + Gold Premium ('light'); Dark mode is an optional toggle
  const [theme, setTheme] = useState<Theme>('light');
  // Auth token kept strictly in JS memory
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeKundli, setActiveKundli] = useState<KundliResult | null>(null);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [rtcConfigured, setRtcConfigured] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setGeminiConfigured(Boolean(data.geminiConfigured));
          setRtcConfigured(Boolean(data.rtcConfigured));
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const loginSession = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    if (SUPPORTED_LANGUAGES.some((l) => l.code === newUser.preferredLanguage)) {
      setLanguage(newUser.preferredLanguage as Language);
    }
  };

  const logoutSession = () => {
    setToken(null);
    setUser(null);
  };

  const t = (en: string, hi: string) => (language === 'hi' || language === 'sa' ? hi : en);
  const locale = LOCALE_STRINGS[language] || LOCALE_STRINGS.en;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        locale,
        theme,
        toggleTheme,
        user,
        token,
        loginSession,
        logoutSession,
        activeKundli,
        setActiveKundli,
        geminiConfigured,
        rtcConfigured,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
