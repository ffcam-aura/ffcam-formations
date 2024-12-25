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
        sans: ['var(--font-source-sans)', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B3D6FF',
          300: '#66ADFF',
          400: '#2E8AFF',
          500: '#0066FF', // Couleur principale - Bleu montagne
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          50: '#F5FFF9',
          100: '#E6FFF0',
          200: '#B3FFD6',
          300: '#66FFAD',
          400: '#1AFF85',
          500: '#00CC66', // Vert forêt
          600: '#00994D',
          700: '#006633',
          800: '#00331A',
          900: '#001A0D',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        accent: {
          DEFAULT: '#FF6B35', // Orange sunset
          light: '#FF8F66',
          dark: '#CC4A1D',
          foreground: 'hsl(var(--accent-foreground))'
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: {
          DEFAULT: '#10B981', // Vert validtion
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#FBBF24', // Jaune attention
          light: '#FCD34D',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444', // Rouge erreur
          light: '#F87171',
          dark: '#DC2626',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;