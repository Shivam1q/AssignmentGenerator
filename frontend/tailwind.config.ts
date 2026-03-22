import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E8572A",
        "primary-dark": "#D14A20",
        "primary-light": "#FFF0EB",
        sidebar: "#FFFFFF",
        "card-border": "#E5E7EB",
        "input-border": "#D1D5DB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        "badge-easy-bg": "#DEF7EC",
        "badge-easy-text": "#03543F",
        "badge-moderate-bg": "#FDF6B2",
        "badge-moderate-text": "#723B13",
        "badge-challenging-bg": "#FDE8E8",
        "badge-challenging-text": "#9B1C1C",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
