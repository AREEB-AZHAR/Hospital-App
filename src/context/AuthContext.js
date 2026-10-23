import React, { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api/api";
import { saveSession, getToken, clearSession } from "../services/storage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const normalizeUser = (u) => {
    if (!u) return u;
    return {
      ...u,
      name: String(u.name || "").trim(),
      email: String(u.email || "").trim(),
      role: String(u.role || "patient").trim().toLowerCase(),
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          setUser(null);
          return;
        }

        const me = await api.get("/users/me");
        const normalized = normalizeUser(me);
        await saveSession(token, normalized);
        setUser(normalized);
      } catch {
        await clearSession();
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = async (phone, password) => {
    try {
      const data = await api.post("/auth/login", {
        phone: String(phone || "").trim(),
        password: String(password || ""),
      });

      if (data?.token) await saveSession(data.token, data.user);
      setUser(normalizeUser(data.user));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e?.message || "Login failed" };
    }
  };

  const signup = async (newUser) => {
    try {
      const payload = {
        name: String(newUser?.name || "").trim(),
        email: String(newUser?.email || "").trim(),
        password: String(newUser?.password || ""),
        phone: String(newUser?.phone || "").trim(),
        hospitalId: String(newUser?.id || "").trim(),
      };

      const data = await api.post("/auth/register", payload);

      if (data?.token) await saveSession(data.token, data.user);
      setUser(normalizeUser(data.user));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e?.message || "Signup failed" };
    }
  };

  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, booting, login, signup, logout }),
    [user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
