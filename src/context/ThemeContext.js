// src/context/ThemeContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors, lightShadows, darkShadows } from "../theme";

const THEME_STORAGE_KEY = "@hospital_app_theme_mode";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeMode, setThemeModeState] = useState("system"); // 'system' | 'light' | 'dark'
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let unmounted = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && ["light", "dark", "system"].includes(saved) && !unmounted) {
          setThemeModeState(saved);
        }
      } catch (err) {
        console.log("Failed to load theme preference:", err);
      } finally {
        if (!unmounted) setLoaded(true);
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);

  const setThemeMode = useCallback(async (mode) => {
    if (!["light", "dark", "system"].includes(mode)) return;
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.log("Failed to persist theme preference:", err);
    }
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    return systemScheme === "dark";
  }, [themeMode, systemScheme]);

  const toggleTheme = useCallback(() => {
    const nextMode = isDark ? "light" : "dark";
    setThemeMode(nextMode);
  }, [isDark, setThemeMode]);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const shadows = useMemo(() => (isDark ? darkShadows : lightShadows), [isDark]);

  const value = useMemo(
    () => ({
      themeMode,
      isDark,
      colors,
      shadows,
      setThemeMode,
      toggleTheme,
      loaded,
    }),
    [themeMode, isDark, colors, shadows, setThemeMode, toggleTheme, loaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback for components used outside ThemeProvider
    return {
      themeMode: "light",
      isDark: false,
      colors: lightColors,
      shadows: lightShadows,
      setThemeMode: () => {},
      toggleTheme: () => {},
      loaded: true,
    };
  }
  return context;
}
