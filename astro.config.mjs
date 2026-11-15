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
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/Hertzline',
				},
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
