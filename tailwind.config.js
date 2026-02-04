/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
		// Path to Tremor module
		'./node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		transparent: 'transparent',
		current: 'currentColor',
		extend: {
			colors: {
				// Emerald palette
				emerald: {
					50: "#ecfdf5",
					100: "#d1fae5",
					200: "#a7f3d0",
					300: "#6ee7b7",
					400: "#34d399",
					500: "#10b981",
					600: "#059669",
					700: "#047857",
					800: "#065f46",
					900: "#064e3b",
					950: "#022c22",
				},
				"deep-charcoal": "#0a0a0b",
				"background-light": "#f1f5f9",
				"background-dark": "#020617",
				// Brand Colors (Clean Blue)
				brand: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					950: '#172554',
				},
				// Tremor colors
				tremor: {
					brand: {
						faint: '#eff6ff',
						muted: '#bfdbfe',
						subtle: '#60a5fa',
						DEFAULT: '#3b82f6',
						emphasis: '#1d4ed8',
						inverted: '#ffffff',
					},
					background: {
						muted: '#f9fafb',
						subtle: '#f3f4f6',
						DEFAULT: '#ffffff',
						emphasis: '#374151',
					},
					border: {
						DEFAULT: '#e5e7eb',
					},
					ring: {
						DEFAULT: '#e5e7eb',
					},
					content: {
						subtle: '#9ca3af',
						DEFAULT: '#6b7280',
						emphasis: '#374151',
						strong: '#111827',
						inverted: '#ffffff',
					},
				},
				// shadcn/ui color system - MUST be inside colors
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			fontFamily: {
				display: ['Plus Jakarta Sans', 'sans-serif'],
				sans: ['Plus Jakarta Sans', 'sans-serif'],
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				'xl': '1.5rem',
				'2xl': '2rem',
				'3xl': '2.5rem',
				'4xl': '3rem',
				// Tremor border radius
				'tremor-small': '0.375rem',
				'tremor-default': '0.5rem',
				'tremor-full': '9999px',
			},
			backgroundImage: {
				// Premium gradient backgrounds
				'premium-gradient': 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(250, 245, 255, 0.2))',
				'premium-header': 'linear-gradient(to right, rgba(37, 99, 235, 0.05), rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05))',
				'gradient-blue': 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05), white)',
				'gradient-purple': 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.05), white)',
				'gradient-emerald': 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05), white)',
				'gradient-rose': 'linear-gradient(to bottom right, rgba(244, 63, 94, 0.1), rgba(251, 113, 133, 0.05), white)',
				'gradient-amber': 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05), white)',
			},
			boxShadow: {
				// === HYBRID TEMPLATE SHADOWS ===
				'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
				'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
				'glow-lg': '0 0 30px rgba(59, 130, 246, 0.4)',
				// Tremor shadows
				'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				// Premium colored shadows
				'premium': '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)',
				'premium-lg': '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
				'blue-sm': '0 1px 2px 0 rgba(59, 130, 246, 0.3)',
				'blue-md': '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
				'blue-lg': '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
				'purple-sm': '0 1px 2px 0 rgba(139, 92, 246, 0.3)',
				'purple-md': '0 4px 6px -1px rgba(139, 92, 246, 0.2)',
				'purple-lg': '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
				'emerald-sm': '0 1px 2px 0 rgba(16, 185, 129, 0.3)',
				'emerald-md': '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
				'emerald-lg': '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
				'rose-sm': '0 1px 2px 0 rgba(244, 63, 94, 0.3)',
				'rose-md': '0 4px 6px -1px rgba(244, 63, 94, 0.2)',
				'rose-lg': '0 10px 15px -3px rgba(244, 63, 94, 0.3)',
			},
			fontSize: {
				// Tremor font sizes
				'tremor-label': ['0.75rem', { lineHeight: '1rem' }],
				'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
				'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
				'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}