/** @type {import('tailwindcss').Config} */
     module.exports = {
       content: [
         './src/**/*.{js,jsx,ts,tsx}', // Ensure Vite scans all JSX files
       ],
       theme: {
         extend: {
           colors: {
             primary: '#60a5fa', // blue-400
             secondary: '#c7d2fe', // indigo-200
             accent: '#5eead4', // teal-200
             success: '#bbf7d0', // green-200
             info: '#bfdbfe', // blue-200
             error: '#fbcfe8', // pink-200
             background: '#f6f8fa', // soft gray
             card: '#fff',
             text: '#23272f', // slate-900
             muted: '#6b7280', // slate-500
           },
         },
       },
       plugins: [],
     };