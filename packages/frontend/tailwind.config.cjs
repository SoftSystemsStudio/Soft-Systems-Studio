/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors (aligned with logo: black, gray, lime green)
        brand: {
          lime: '#84CC16', // Primary accent from logo
          'lime-bright': '#A3E635', // Hover state
          'lime-dark': '#65A30D', // Active state
          gray: '#9CA3AF', // Logo gray
          'gray-light': '#D1D5DB', // Text gray
          black: '#000000', // Background
        },
        // Simplified dark theme palette
        bg: '#050505',
        text: '#F3F4F6',
        muted: '#9CA3AF',
        border: '#374151',
        surface: '#111111',
        accent: '#84CC16',
        'primary-accent': '#84CC16',
        // Single glow color (lime only)
        glow: {
          lime: '#84CC16',
        },
      },
      boxShadow: {
        // Subtle, professional glows (reduced intensity)
        glow: '0 0 15px 2px rgba(132, 204, 22, 0.2)',
        'glow-sm': '0 0 8px 1px rgba(132, 204, 22, 0.15)',
        'glow-lg': '0 0 20px 4px rgba(132, 204, 22, 0.25)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
        'gradient-hero':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(192, 255, 107, 0.15), transparent)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px 2px rgba(132, 204, 22, 0.2)' },
          '50%': { boxShadow: '0 0 15px 4px rgba(132, 204, 22, 0.3)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        scan: 'scan 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Courier New', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
      },
    },
  },
  plugins: [],
};
