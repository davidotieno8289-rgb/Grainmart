/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#C8851A',
          light: '#F0A830',
          pale: '#FDF0D5',
        },
        green: {
          DEFAULT: '#2D5016',
          light: '#4A7C28',
          pale: '#EAF0E2',
        },
        terra: '#C94A1A',
        cream: '#FBF5E6',
        dark: '#1A1208',
        brown: '#3D2B0E',
        muted: '#7A6040',
        border: '#E8D9BC',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        'micro': '0.72rem',
        'xs': '0.78rem',
        'sm': '0.82rem',
        'base': '0.88rem',
        'md': '0.95rem',
        'lg': '1rem',
        'xl': '1.1rem',
        '2xl': '1.4rem',
        '3xl': '1.8rem',
        '4xl': '2.5rem',
        '5xl': '3.5rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'badge-pop': 'badgePop 0.3s ease forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        badgePop: {
          '0%': { transform: 'scale(0)' },
          '70%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(26, 18, 8, 0.08)',
        'card-hover': '0 8px 24px rgba(26, 18, 8, 0.12)',
        'modal': '0 16px 48px rgba(26, 18, 8, 0.2)',
      },
    },
  },
  plugins: [],
}
