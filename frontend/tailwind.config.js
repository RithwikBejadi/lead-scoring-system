/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2c5181",
        "primary-dark": "#1e3a5f",
        "background-light": "#f6f7f8",
        "background-dark": "#14181e",
        "surface-light": "#ffffff",
        "surface-dark": "#1e2329",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "pulse-ring":
          "pulseRing 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "drawer-in": "drawerIn 0.3s ease-out forwards",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.33)" },
          "80%, 100%": { opacity: "0" },
        },
        drawerIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
