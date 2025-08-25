"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextValue {
  theme: string;
  toggleTheme: () => void;
  fontScale: number;
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("light");
  const [fontScale,setFontScale] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storagetheme = localStorage.getItem("theme");
      const t = storagetheme || "light";
      setTheme(t);
      document.documentElement.setAttribute("data-bs-theme", t);
      const storedScale = parseFloat(localStorage.getItem('fontScale')||'1');
      if(!isNaN(storedScale)) setFontScale(storedScale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    if (typeof window !== "undefined") localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply font scale (cap 0.8 - 1.6)
  useEffect(()=> {
    const clamped = Math.min(1.6, Math.max(0.8, fontScale));
    document.documentElement.style.setProperty('--font-scale', clamped.toString());
    if (typeof window !== 'undefined') localStorage.setItem('fontScale', clamped.toString());
  }, [fontScale]);

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));
  const increaseFont = () => setFontScale(s => Math.min(1.6, +(s + 0.1).toFixed(2)));
  const decreaseFont = () => setFontScale(s => Math.max(0.8, +(s - 0.1).toFixed(2)));
  const resetFont = () => setFontScale(1);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontScale, increaseFont, decreaseFont, resetFont }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
