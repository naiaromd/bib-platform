import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F4EFE5",
        paper: "#FAF7F1",
        card: "#FFFFFF",
        ink: "#2C2A28",
        "ink-2": "#4A4641",
        muted: "#8A7F70",
        line: "#E4DCCD",
        chalk: "#D4CBBB",
        rose: "#C89B8A",
        "rose-soft": "#EED9D0",
        "rose-ink": "#6E4A3E",
        good: "#5E7F5C",
        warn: "#B07E42",
        bad: "#8C3A2A",
        "bad-soft": "#F6E3DE",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
