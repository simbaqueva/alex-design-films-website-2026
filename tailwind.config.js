/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./assets/components/**/*.{html,js}",
    "./assets/js/**/*.{js,ts}",
    "./assets/css/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#1d4ed8'
        }
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif']
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '0.75rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem'
      },
      borderRadius: {
        'full': '9999px',
        'lg': '0.5rem',
        'md': '0.375rem',
        'sm': '0.25rem'
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'pulse': 'pulse 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0.7' }
        }
      }
    },
  },
  plugins: [],
  // Mantener compatibilidad con CSS personalizado
  corePlugins: {
    // Desactivar plugins que conflictúan con CSS existente
    preflight: false,
  }
}
