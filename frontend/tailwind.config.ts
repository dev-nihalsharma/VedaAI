import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101218',
        muted: '#6b7280',
        page: '#f3f4f6',
        card: '#ffffff',
        brand: '#0f1115', // near-black CTA
        accent: '#ff6a3d', // orange used on logo / Create Assignment
        easy: '#16a34a',
        moderate: '#d97706',
        hard: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
