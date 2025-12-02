/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Design Tokens - Modern Minimalism Premium
				primary: {
					50: '#ECFDF5',
					100: '#D1FAE5',
					500: '#10B981', // Verde médico principal
					600: '#059669',
					900: '#064E3B',
					DEFAULT: '#10B981',
					foreground: '#FFFFFF',
				},
				neutral: {
					50: '#FAFAFA',
					100: '#F5F5F5',
					200: '#E5E5E5',
					500: '#A3A3A3',
					700: '#404040',
					900: '#171717',
				},
				// Semantics
				success: '#10B981',
				error: '#EF4444',
				warning: '#F59E0B',
				info: '#3B82F6',
				// Background
				'bg-page': '#FAFAFA',
				'bg-surface': '#FFFFFF',
				// Text
				'text-primary': '#171717',
				'text-secondary': '#404040',
				'text-disabled': '#A3A3A3',
				'text-inverse': '#FFFFFF',
				// Legacy support
				secondary: {
					DEFAULT: '#10B981',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#F5F5F5',
					foreground: '#404040',
				},
				accent: {
					DEFAULT: '#10B981',
					foreground: '#FFFFFF',
				},
				destructive: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF',
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#171717',
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#171717',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate'), require('tailwind-scrollbar')({ nocompatible: true })],
}