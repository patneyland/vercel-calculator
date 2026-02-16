import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "calc-bg": "#0b0d12",
        "calc-surface": "#131722",
        "calc-display": "#0f141e",
        "calc-operator": "#f59e0b",
        "calc-operator-hover": "#fbbf24",
        "calc-number": "#1f2533",
        "calc-muted": "#a8b1c3"
      },
      boxShadow: {
        soft: "0 20px 60px -30px rgba(0,0,0,0.8)",
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.6)"
      }
    }
  },
  plugins: []
};

export default config;
