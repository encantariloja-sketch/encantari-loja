import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vinho: '#491E2F',
        'vinho-light': '#6B2D45',
        rosa: '#EF9493',
        'rosa-light': '#F5B8B7',
        bege: '#F6CA99',
        'bege-light': '#FAE0C0',
        oliva: '#8F9150',
        'oliva-light': '#A8A96A',
        creme: '#FEF4F3',
        'creme-dark': '#F8E8E6',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-encantari': 'linear-gradient(135deg, #FEF4F3 0%, #F8E8E6 50%, #FEF4F3 100%)',
      },
    },
  },
  plugins: [],
}

export default config
