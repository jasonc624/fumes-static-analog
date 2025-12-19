/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff0266',
        secondary: '#4ecdc4',
        tertiary: '#d6dbd2',
        quaternary: '#ffde03',
        accent: '#4ecdc4',
        warn: '#ffc107',
        success: '#5ccd56',
        danger: '#d91930',
        info: '#008dd3',
        'app-bg': '#fbfbfe',
        'body-background': '#e0e3ee',
        'text-on-white': '#32325d',
        'base-font-color': '#3e3e3e',
        'really-light-gray': '#f5f5f4',
        'light-gray': '#e5e5e5',
        'medium-gray': '#adadad',
        'dark-gray': '#504f4f',
        'really-dark-gray': '#333',
      },
      fontFamily: {
        'primary': ['Noto Sans', 'sans-serif'],
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(45deg, #ff0266, #d61f49)',
        'danger-gradient': 'linear-gradient(45deg, #eb3349, #ff0266)',
        'success-gradient': 'linear-gradient(45deg, #5ccd56, #a8e063)',
        'warn-gradient': 'linear-gradient(45deg, #ffc107, #edde5d)',
        'tri-gradient': 'radial-gradient(circle at 11.97% 21%, #ff0266, transparent 59%), radial-gradient(circle at 77.56% 18.89%, #ffc107, transparent 81%), radial-gradient(circle at 50% 50%, #fff, #fff 100%)',
      }
    },
  },
  plugins: [],
}