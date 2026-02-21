/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2b6cee",
        "primary-dark": "#1a5ac6",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
        "border-light": "#e0e0e0",
        "border-gray": "#e0e0e0",
        "border-dark": "#2d3748",
        "text-primary-light": "#202124",
        "text-secondary-light": "#5f6368",
        "text-primary-dark": "#e2e8f0",
        "text-secondary-dark": "#94a3b8",
        success: "#1e8e3e",
        warning: "#f9ab00",
        error: "#d93025",
        "google-border": "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      boxShadow: {
        subtle:
          "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        glow: "0 0 15px -3px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
