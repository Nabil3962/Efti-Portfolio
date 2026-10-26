export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0e0e10',
        panel: '#16161a',
        line: '#26262c',
        accent: 'rgb(var(--accent) / <alpha-value>)'
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif']
      }
    }
  }
}
