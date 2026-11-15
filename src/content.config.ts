import { defineCollection } from 'astro:content'
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'

// Custom Hertzline UI strings. Parity of required keys is enforced by
// scripts/check_hz042.mjs (missing-key gate). Starlight built-in Italian UI
// strings ship with @astrojs/starlight (dist/translations/it.js).
export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	i18n: defineCollection({
		loader: i18nLoader(),
		schema: i18nSchema({
			extend: z.object({
				'hz.tagline': z.string(),
				'hz.docs.scaffoldNote': z.string(),
			}),
		}),
	}),
}
