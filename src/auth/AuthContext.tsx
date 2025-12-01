import React, { createContext, useContext, useEffect, useState } from "react";
import type { AdminUser, UserRole } from "./storage";
import { ensureDefaultBadmin, loadAdmins, saveAdmins, sha256 } from "./storage";

interface AuthState {
  user: AdminUser | null;
  role: UserRole;
  login: (username: string, password: string) => Promise<"ok" | "error">;
  logout: () => void;
  admins: AdminUser[];
  createSadmin: (username: string, password: string) => Promise<void>;
  deleteAdmin: (username: string) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const CURRENT_USER_KEY = "atilan_current_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  useEffect(() => {
    (async () => {
      const defaultHash = await sha256("admin999");
      ensureDefaultBadmin(defaultHash);
      const loaded = loadAdmins();
      setAdmins(loaded);
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(CURRENT_USER_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as AdminUser;
            const real = loaded.find((a) => a.username === parsed.username);
            if (real) setUser(real);
          } catch {
            // ignore
          }
        }
      }
    })();
  }, []);

  const persistUser = (next: AdminUser | null) => {
    if (typeof localStorage === "undefined") return;
    if (next) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  const login = async (username: string, password: string) => {
    const hash = await sha256(password);
    const loaded = loadAdmins();
    setAdmins(loaded);
    const found = loaded.find((a) => a.username === username && a.passwordHash === hash);
    if (!found) {
      return "error";
    }
    setUser(found);
    persistUser(found);
    return "ok";
  };

  const logout = () => {
    setUser(null);
    persistUser(null);
  };

  const createSadmin = async (username: string, password: string) => {
    const hash = await sha256(password);
    const current = loadAdmins();
    if (current.find((a) => a.username === username)) {
      throw new Error("Bu istifadəçi adı artıq mövcuddur.");
    }
    const next: AdminUser = { username, passwordHash: hash, role: "Sadmin" };
    const updated = [...current, next];
    saveAdmins(updated);
    setAdmins(updated);
  };

  const deleteAdmin = (username: string) => {
    const current = loadAdmins();
    const updated = current.filter((a) => a.username !== username || a.role === "Badmin");
    saveAdmins(updated);
    setAdmins(updated);
    if (user && user.username === username) {
      logout();
    }
  };

  const role: UserRole = user?.role ?? "Guest";

  const value: AuthState = {
    user,
    role,
    login,
    logout,
    admins,
    createSadmin,
    deleteAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("AuthContext xaricində istifadə olunur");
  }
  return ctx;
}


