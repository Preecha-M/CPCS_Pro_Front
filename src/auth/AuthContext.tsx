import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Role = "admin" | "researcher";

export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  role: Role;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as User;
      setUser(data);
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || `Login failed (${res.status})`);
    }
    const data = (await res.json()) as User;
    setUser(data);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  useEffect(() => {
    refreshMe();
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, refreshMe }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
