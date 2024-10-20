module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	darkMode: ['class', 'class'],
	plugins: [require('tailwindcss-safe-area'), require('tailwindcss-animate')],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			boxShadow: {
				custom:
					'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			},
			colors: {
				nord: {
					0: '#2E3440', // Polar Night colors
					1: '#3B4252',
					2: '#434C5E',
					3: '#4C566A',
					4: '#D8DEE9', // Snow Storm colors
					5: '#E5E9F0',
					6: '#ECEFF4',
					7: '#8FBCBB', // Frost colors
					8: '#88C0D0',
					9: '#81A1C1',
					10: '#5E81AC',
					11: '#BF616A', // Aurora colors
					12: '#D08770',
					13: '#EBCB8B',
					14: '#A3BE8C',
					15: '#B48EAD',
					'custom-primary': '#70C145',
					'custom-accent': '#A9E689',
				},
			},
			backgroundColor: (theme) => ({
				...theme('colors'), // Use Nord colors for background
			}),
			textColor: (theme) => ({
				...theme('colors'), // Use Nord colors for text
			}),
			borderColor: (theme) => ({
				...theme('colors'), // Use Nord colors for borders
			}),
		},
	},
}
