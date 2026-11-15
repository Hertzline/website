// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// Placeholder until the owner sets the production domain (HZ-040).
const siteUrl = 'https://hertzline.example'

// https://astro.build/config
// Static only: no adapter, no server functions, no DB, no secrets.
export default defineConfig({
	site: siteUrl,
	output: 'static',
	integrations: [
		starlight({
			title: 'Hertzline',
			description:
				'Measure, explain, and reverse game and desktop performance changes.',
			logo: {
				src: './src/assets/logo.svg',
				alt: 'Hertzline',
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/Hertzline',
				},
			],
			customCss: [
				'@fontsource/instrument-sans/400.css',
				'@fontsource/instrument-sans/500.css',
				'@fontsource/instrument-sans/600.css',
				'@fontsource/instrument-sans/700.css',
				'@fontsource/ibm-plex-mono/400.css',
				'@fontsource/ibm-plex-mono/500.css',
				'@fontsource/ibm-plex-mono/600.css',
				'@fontsource/ibm-plex-mono/700.css',
				'./src/styles/design-tokens.css',
			],
			sidebar: [
				{
					label: 'Start',
					items: [{ label: 'Overview', slug: 'index' }],
				},
			],
		}),
	],
})
