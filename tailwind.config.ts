import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E40AF', // Bleu primaire
          light: '#60A5FA',   // Bleu clair
          dark: '#1E3A8A',    // Bleu foncé
        },
        secondary: {
          DEFAULT: '#10B981', // Vert secondaire
          light: '#6EE7B7',   // Vert clair
          dark: '#047857',    // Vert foncé
        },
        neutral: {
          DEFAULT: '#6B7280', // Gris neutre
          light: '#D1D5DB',   // Gris clair
          dark: '#374151',    // Gris foncé
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;