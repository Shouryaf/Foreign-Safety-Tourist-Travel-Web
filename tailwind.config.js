/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Teal + Blue + White theme
        primary: {
          DEFAULT: '#0d9488', // Teal 600
          light: '#14b8a6', // Teal 500
          dark: '#0f766e', // Teal 700
          foreground: '#f8fafc', // Slate 50
        },
        secondary: {
          DEFAULT: '#0284c7', // Sky 600
          light: '#0ea5e9', // Sky 500
          dark: '#0369a1', // Sky 700
          foreground: '#f8fafc', // Slate 50
        },
        accent: {
          DEFAULT: '#0891b2', // Cyan 600
          light: '#06b6d4', // Cyan 500
          dark: '#0e7490', // Cyan 700
          foreground: '#f8fafc', // Slate 50
        },
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc', // Slate 50
          tertiary: '#f1f5f9', // Slate 100
        },
        danger: {
          DEFAULT: '#dc2626', // Red 600
          light: '#ef4444', // Red 500
          dark: '#b91c1c', // Red 700
        },
        success: {
          DEFAULT: '#16a34a', // Green 600
          light: '#22c55e', // Green 500
          dark: '#15803d', // Green 700
        },
        warning: {
          DEFAULT: '#d97706', // Amber 600
          light: '#f59e0b', // Amber 500
          dark: '#b45309', // Amber 700
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        // Neumorphic shadows
        'neumorph-sm': '4px 4px 8px #e2e8f0, -4px -4px 8px #ffffff',
        'neumorph': '8px 8px 16px #e2e8f0, -8px -8px 16px #ffffff',
        'neumorph-lg': '12px 12px 24px #e2e8f0, -12px -12px 24px #ffffff',
        'neumorph-inner': 'inset 4px 4px 8px #e2e8f0, inset -4px -4px 8px #ffffff',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
