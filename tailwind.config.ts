import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff9f5",
          100: "#d7f0e5",
          200: "#b0e1cc",
          300: "#7fcbac",
          400: "#4bab86",
          500: "#2c8d6a",
          600: "#1f7256",
          700: "#1c5b46",
          800: "#1a493a",
          900: "#173d31",
        },
      },
    },
  },
  plugins: [],
};

export default config;
