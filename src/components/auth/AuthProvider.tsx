'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  roles: { name: string; permissions: string[] }[];
  role?: string;
  organization?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ requireMfa: boolean }>;
  verifyMfa: (code: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  login: async () => ({ requireMfa: false }),
  verifyMfa: async () => false,
  logout: () => {},
  getAuthHeaders: () => ({}),
});

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'terra_forest_token';
const USER_KEY = 'terra_forest_user';

// Helper to read from localStorage safely (client-only)
function getStoredAuth(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const stored = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (stored && storedToken) {
      return { user: JSON.parse(stored), token: storedToken };
    }
  } catch {
    // Ignore parse errors
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage synchronously — no flash of unauthenticated state
  const [user, setUser] = useState<User | null>(getStoredAuth().user);
  const [token, setToken] = useState<string | null>(getStoredAuth().token);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMfaToken, setPendingMfaToken] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  // Keep localStorage in sync if changed in another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_KEY || e.key === TOKEN_KEY) {
        const { user: storedUser, token: storedToken } = getStoredAuth();
        setUser(storedUser);
        setToken(storedToken);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Invalid credentials');
      }

      if (data.data?.mfa_required) {
        setPendingMfaToken(data.data.mfa_token);
        setPendingUserId(data.data.user_id);
        return { requireMfa: true };
      }

      // No MFA - store token and user
      const jwt = data.data.token;
      const userData = data.data.user;
      localStorage.setItem(TOKEN_KEY, jwt);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
      return { requireMfa: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyMfa = useCallback(async (code: string) => {
    if (!pendingMfaToken) return false;
    if (code.length !== 6) return false;

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pendingMfaToken}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (res.ok && data.data?.token) {
        const jwt = data.data.token;
        const userData = data.data.user;
        localStorage.setItem(TOKEN_KEY, jwt);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setToken(jwt);
        setUser(userData);
        setPendingMfaToken(null);
        setPendingUserId(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [pendingMfaToken, pendingUserId]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setPendingMfaToken(null);
    setPendingUserId(null);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, token, login, verifyMfa, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}
