/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          lime: '#c0ff6b',
          'lime-dark': '#9fdd4a',
          light: '#d5d5d5',
          gray: '#656565',
          black: '#000000',
        },
        // Semantic colors
        bg: '#000000',
        text: '#d5d5d5',
        muted: '#656565',
        border: '#2a2a2a',
        surface: '#0a0a0a',
        accent: '#c0ff6b',
        // Futuristic accent colors
        glow: {
          cyan: '#22d3ee',
          lime: '#c0ff6b',
          fuchsia: '#d946ef',
        },
      },
      boxShadow: {
        glow: '0 0 20px 2px rgba(192, 255, 107, 0.4)',
        'glow-sm': '0 0 10px 1px rgba(192, 255, 107, 0.3)',
        'glow-lg': '0 0 30px 4px rgba(192, 255, 107, 0.5)',
        'glow-cyan': '0 0 20px 4px rgba(34, 211, 238, 0.5)',
        'glow-fuchsia': '0 0 20px 4px rgba(217, 70, 239, 0.5)',
        neon: '0 0 5px #c0ff6b, 0 0 20px #c0ff6b, 0 0 40px #c0ff6b',
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
          '0%, 100%': { boxShadow: '0 0 20px 2px rgba(192, 255, 107, 0.4)' },
          '50%': { boxShadow: '0 0 40px 8px rgba(192, 255, 107, 0.6)' },
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
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
