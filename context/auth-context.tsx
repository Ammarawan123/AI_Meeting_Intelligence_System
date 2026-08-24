"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "meeting-intel-token";

const demoUser: User = {
  id: "demo-user",
  name: "Avery Morgan",
  email: "demo@meetingintel.ai",
  role: "admin",
  avatar: "AM",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(STORAGE_KEY) ? demoUser : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    localStorage.setItem(STORAGE_KEY, "demo-token");
    setUser(demoUser);
    return demoUser;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (!name || !email || !password) {
      throw new Error("Please fill in all fields.");
    }

    const createdUser: User = {
      ...demoUser,
      id: `user-${Date.now()}`,
      name,
      email,
    };

    localStorage.setItem(STORAGE_KEY, "demo-token");
    setUser(createdUser);
    return createdUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [login, logout, register, user],
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
