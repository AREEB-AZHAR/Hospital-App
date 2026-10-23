import React, { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api/api";
import { saveSession, getToken, clearSession, getStoredUser } from "../services/storage";

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
    let unmounted = false;
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([
          getToken().catch(() => null),
          getStoredUser().catch(() => null),
        ]);

        if (storedUser && !unmounted) {
          setUser(normalizeUser(storedUser));
        }

        if (!token) {
          if (!unmounted && !storedUser) setUser(null);
          return;
        }

        // Add 3.5s timeout so booting unblocks immediately even if API is slow or offline
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Boot timeout")), 3500)
        );

        try {
          const me = await Promise.race([api.get("/users/me"), timeoutPromise]);
          if (!unmounted && me) {
            const normalized = normalizeUser(me);
            await saveSession(token, normalized);
            setUser(normalized);
          }
        } catch {
          // If network fails or times out, keep storedUser if available
          if (!storedUser && !unmounted) {
            setUser(null);
          }
        }
      } catch {
        if (!unmounted) setUser(null);
      } finally {
        if (!unmounted) setBooting(false);
      }
    })();

    return () => {
      unmounted = true;
    };
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
