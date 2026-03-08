/** @type {import('tailwindcss').Config} */
const typography = require("@tailwindcss/typography");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        primary: {
          DEFAULT: "#e89374",
          50: "#fef5f2",
          100: "#fde8e1",
          200: "#fcd5c8",
          300: "#f4b69e",
          400: "#e89374",
          500: "#d97a56",
          600: "#c4613e",
          700: "#a44e32",
          800: "#87422d",
          900: "#713a2a",
        },
        secondary: {
          DEFAULT: "#236fb4",
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdbff",
          300: "#8ec4ff",
          400: "#59a2ff",
          500: "#3480f6",
          600: "#236fb4",
          700: "#1b5591",
          800: "#1c4877",
          900: "#1c3d64",
        },
        surface: {
          DEFAULT: "#efeffb",
          50: "#fafaff",
          100: "#efeffb",
          200: "#e2e2f5",
          300: "#cccce8",
          400: "#b0b0d6",
          500: "#9494c2",
          600: "#7a7aab",
          700: "#62628a",
          800: "#515170",
          900: "#44445c",
        },
        // Marker / chalk accent colors
        marker: {
          red: "var(--marker-red)",
          blue: "var(--marker-blue)",
          green: "var(--marker-green)",
          orange: "var(--marker-orange)",
          purple: "var(--marker-purple)",
          black: "var(--marker-black)",
        },
        // Semantic / UI tokens — CSS custom-property RGB channels
        // auto-switch with theme AND support opacity modifiers.
        background: {
          DEFAULT: "rgb(var(--color-bg-rgb) / <alpha-value>)",
          dark: "#1a2721", // keep for back-compat
        },
        foreground: {
          DEFAULT: "rgb(var(--color-fg-rgb) / <alpha-value>)",
          muted: "rgb(var(--color-fg-muted-rgb) / <alpha-value>)",
          secondary: "rgb(var(--color-fg-muted-rgb) / <alpha-value>)",
          dark: "#e4dfd4", // keep for back-compat
          "dark-muted": "#a09888", // keep for back-compat
        },
        card: {
          DEFAULT: "rgb(var(--color-card-rgb) / <alpha-value>)",
          dark: "#223029", // keep for back-compat
        },
        border: {
          DEFAULT: "rgb(var(--color-border-rgb) / <alpha-value>)",
          dark: "#3a4f41", // keep for back-compat
        },
        // Status colors (marker-inspired)
        success: {
          DEFAULT: "var(--color-success)",
          50: "#ecfdf5",
          600: "#059669",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          50: "#fffbeb",
          600: "#d97706",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          50: "#fef2f2",
          600: "#dc2626",
        },
        info: {
          DEFAULT: "var(--color-info)",
          50: "#eff6ff",
          600: "#2563eb",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-permanent-marker)", "cursive"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // Whiteboard: offset shadow like a pinned card
        soft: "2px 3px 0 rgba(var(--shadow-rgb), 0.06), 0 1px 3px rgba(var(--shadow-rgb), 0.04)",
        "soft-lg":
          "3px 5px 0 rgba(var(--shadow-rgb), 0.08), 0 4px 12px rgba(var(--shadow-rgb), 0.06)",
        glow: "0 0 20px rgba(232, 147, 116, 0.3)",
        "glow-blue": "0 0 20px rgba(42, 114, 184, 0.3)",
        // Chalk dust glow for dark mode accents
        chalk: "0 0 12px rgba(228, 223, 212, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [typography],
};
