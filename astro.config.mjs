// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// Placeholder until the owner sets the production domain (HZ-040).
const siteUrl = 'https://hertzline.example'

// https://astro.build/config
// Static only: no adapter, no server functions, no DB, no secrets.
// i18n: English is the root locale (no /en/ prefix); Italian under /it/ (HZ-042).
// Official: https://starlight.astro.build/guides/i18n/
export default defineConfig({
	site: siteUrl,
	output: 'static',
	integrations: [
		starlight({
			title: 'Hertzline',
			description:
				'Measure, explain, and reverse game and desktop performance changes.',
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'English',
					lang: 'en',
				},
				it: {
					label: 'Italiano',
					lang: 'it',
				},
			},
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
			// Site-wide social image (HZ-046). Starlight already emits og:* + twitter:card.
			head: [
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: `${siteUrl}/og.svg`,
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:image',
						content: `${siteUrl}/og.svg`,
					},
				},
			],
			customCss: [
				'@fontsource/instrument-sans/400.css',
				'@fontsource/instrument-sans/500.css',
				'@fontsource/instrument-sans/600.css',
				'@fontsource/instrument-sans/700.css',
				'@fontsource/jetbrains-mono/400.css',
				'@fontsource/jetbrains-mono/500.css',
				'@fontsource/jetbrains-mono/600.css',
				'@fontsource/jetbrains-mono/700.css',
				'./src/styles/design-tokens.css',
				'./src/styles/product-pages.css',
			],
			sidebar: [
				{
					label: 'Product',
					translations: {
						it: 'Prodotto',
					},
					items: [
						{
							label: 'Home',
							slug: 'index',
							translations: {
								it: 'Home',
							},
						},
						{
							label: 'How it works',
							slug: 'how-it-works',
							translations: {
								it: 'Come funziona',
							},
						},
						{
							label: 'Actions',
							slug: 'actions',
							translations: {
								it: 'Azioni',
							},
						},
						{
							label: 'Anti-cheat',
							slug: 'anti-cheat',
							translations: {
								it: 'Anti-cheat',
							},
						},
						{
							label: 'Privacy',
							slug: 'privacy',
							translations: {
								it: 'Privacy',
							},
						},
						{
							label: 'Changelog',
							slug: 'changelog',
							translations: {
								it: 'Changelog',
							},
						},
						{
							label: 'Download',
							slug: 'download',
							translations: {
								it: 'Download',
							},
						},
					],
				},
				{
					label: 'Documentation',
					translations: {
						it: 'Documentazione',
					},
					items: [
						{
							label: 'Overview',
							slug: 'docs',
							translations: {
								it: 'Panoramica',
							},
						},
						{
							label: 'Getting started',
							slug: 'docs/getting-started',
							translations: {
								it: 'Per iniziare',
							},
						},
						{
							label: 'Installation',
							slug: 'docs/installation',
							translations: {
								it: 'Installazione',
							},
						},
						{
							label: 'First benchmark',
							slug: 'docs/first-benchmark',
							translations: {
								it: 'Primo benchmark',
							},
						},
						{
							label: 'Profiles',
							slug: 'docs/profiles',
							translations: {
								it: 'Profili',
							},
						},
						{
							label: 'Actions reference',
							slug: 'docs/actions',
							translations: {
								it: 'Riferimento azioni',
							},
						},
						{
							label: 'Rollback and safety',
							slug: 'docs/rollback',
							translations: {
								it: 'Rollback e sicurezza',
							},
						},
						{
							label: 'Troubleshooting',
							slug: 'docs/troubleshooting',
							translations: {
								it: 'Risoluzione problemi',
							},
						},
						{
							label: 'FAQ',
							slug: 'docs/faq',
							translations: {
								it: 'FAQ',
							},
						},
						{
							label: 'Building from source',
							slug: 'docs/building-from-source',
							translations: {
								it: 'Compilare dal sorgente',
							},
						},
						{
							label: 'Contributing',
							slug: 'docs/contributing',
							translations: {
								it: 'Contribuire',
							},
						},
						{
							label: 'Architecture',
							slug: 'docs/architecture',
							translations: {
								it: 'Architettura',
							},
						},
						{
							label: 'Security',
							slug: 'docs/security',
							translations: {
								it: 'Sicurezza',
							},
						},
					],
				},
			],
		}),
	],
})
