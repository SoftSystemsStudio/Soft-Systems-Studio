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
      },
      boxShadow: {
        glow: '0 0 20px 2px rgba(192, 255, 107, 0.4)',
        'glow-sm': '0 0 10px 1px rgba(192, 255, 107, 0.3)',
        'glow-lg': '0 0 30px 4px rgba(192, 255, 107, 0.5)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
        'gradient-hero':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(192, 255, 107, 0.15), transparent)',
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
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
