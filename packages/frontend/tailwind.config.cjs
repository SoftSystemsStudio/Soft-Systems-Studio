/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#02040a',
        text: '#e5e7eb',
        muted: '#9ca3af',
        border: '#1f2933',
        surface: '#0b1220',
        accent: '#c0ff6b',
        // High contrast accent palette for dark theme
        glow: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          indigo: '#6366f1',
        },
      },
      boxShadow: {
        glow: '0 0 20px 2px rgba(168, 85, 247, 0.5)',
        'glow-cyan': '0 0 20px 2px rgba(34, 211, 238, 0.5)',
        'glow-accent': '0 0 20px 2px rgba(192, 255, 107, 0.4)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, #02040a 0%, #0b1220 50%, #02040a 100%)',
        'gradient-hero':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent)',
      },
    },
  },
  plugins: [],
};
