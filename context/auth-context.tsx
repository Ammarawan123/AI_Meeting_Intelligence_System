"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/types";
import { api } from "@/shared/lib/api-client";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "meeting-intel-token";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<User>("/auth/me")
      .then((response) => setUser(response.data))
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    try {
      const tokenResponse = await api.post<TokenResponse>("/auth/login", { email, password });
      localStorage.setItem(STORAGE_KEY, tokenResponse.data.access_token);

      const userResponse = await api.get<User>("/auth/me");
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      const detail = (error as { detail?: string })?.detail;
      throw new Error(detail ?? "Login failed. Check your email and password.");
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      throw new Error("Please fill in all fields.");
    }

    try {
      const tokenResponse = await api.post<TokenResponse>("/auth/register", { name, email, password });
      localStorage.setItem(STORAGE_KEY, tokenResponse.data.access_token);

      const userResponse = await api.get<User>("/auth/me");
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      const detail = (error as { detail?: string })?.detail;
      throw new Error(detail ?? "Registration failed. Please try again.");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
