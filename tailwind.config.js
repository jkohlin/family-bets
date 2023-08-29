module.exports = {
  content: ['./app/**/*.{ts,tsx,jsx,js}', './app/root.jsx'],
  theme: {
    extend: {
      gridTemplateColumns: ({ theme }) => {
        const spacing = theme('spacing')

        return Object.keys(spacing).reduce((accumulator, spacingKey) => {
          return {
            ...accumulator,
            [`fit-${spacingKey}`]: `repeat(auto-fit, minmax(${spacing[spacingKey]}, 1fr))`,
          }
        }, {})
      },
    },
  },
  plugins: [],
}
