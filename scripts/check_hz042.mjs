import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const readme = readFileSync(join(root, 'README.md'), 'utf8')

if (!config.includes("defaultLocale: 'root'") && !config.includes('defaultLocale: "root"')) {
	fail('astro.config must set defaultLocale: root (English without /en/ prefix)')
}
if (!/locales\s*:\s*\{[\s\S]*root\s*:/.test(config)) {
	fail('astro.config locales must include root (English)')
}
if (!/locales\s*:\s*\{[\s\S]*\bit\s*:/.test(config)) {
	fail('astro.config locales must include it (Italian under /it/)')
}
if (!/root\s*:\s*\{[\s\S]*lang:\s*['"]en['"]/.test(config)) {
	fail('root locale must set lang: en')
}
if (!/\bit\s*:\s*\{[\s\S]*lang:\s*['"]it['"]/.test(config)) {
	fail('it locale must set lang: it')
}

const requiredCustomKeys = ['hz.tagline', 'hz.docs.scaffoldNote']
const enPath = join(root, 'src/content/i18n/en.json')
const itPath = join(root, 'src/content/i18n/it.json')
if (!existsSync(enPath)) fail('src/content/i18n/en.json missing')
if (!existsSync(itPath)) fail('src/content/i18n/it.json missing')

const en = JSON.parse(readFileSync(enPath, 'utf8'))
const it = JSON.parse(readFileSync(itPath, 'utf8'))

const enKeys = Object.keys(en).sort()
const itKeys = Object.keys(it).sort()

for (const key of requiredCustomKeys) {
	if (!(key in en)) fail(`en.json missing required key: ${key}`)
	if (!(key in it)) fail(`it.json missing required key: ${key}`)
	if (typeof en[key] !== 'string' || en[key].trim() === '') {
		fail(`en.json empty value for ${key}`)
	}
	if (typeof it[key] !== 'string' || it[key].trim() === '') {
		fail(`it.json empty value for ${key}`)
	}
}

const missingInIt = enKeys.filter((k) => !(k in it))
const missingInEn = itKeys.filter((k) => !(k in en))
if (missingInIt.length) fail(`it.json missing keys present in en.json: ${missingInIt.join(', ')}`)
if (missingInEn.length) fail(`en.json missing keys present in it.json: ${missingInEn.join(', ')}`)

const contentConfig = readFileSync(join(root, 'src/content.config.ts'), 'utf8')
if (!contentConfig.includes('i18nLoader') || !contentConfig.includes('i18nSchema')) {
	fail('content.config.ts must configure Starlight i18n collection')
}
for (const key of requiredCustomKeys) {
	if (!contentConfig.includes(`'${key}'`)) {
		fail(`content.config.ts must extend i18n schema with ${key}`)
	}
}

const docsRoot = join(root, 'src/content/docs')
const docsIt = join(docsRoot, 'it')
if (!existsSync(join(docsRoot, 'index.mdx')) && !existsSync(join(docsRoot, 'index.md'))) {
	fail('English root docs index missing (src/content/docs/index.mdx)')
}
if (!existsSync(join(docsIt, 'index.mdx')) && !existsSync(join(docsIt, 'index.md'))) {
	fail('Italian docs index missing (src/content/docs/it/index.mdx)')
}
if (!existsSync(join(docsRoot, '404.md')) && !existsSync(join(docsRoot, '404.mdx'))) {
	fail('English 404 page missing')
}
if (!existsSync(join(docsIt, '404.md')) && !existsSync(join(docsIt, '404.mdx'))) {
	fail('Italian 404 page missing')
}

const listDocPages = (dir, base = dir) => {
	const out = []
	for (const name of readdirSync(dir)) {
		if (name === 'it') continue
		const p = join(dir, name)
		if (statSync(p).isDirectory()) out.push(...listDocPages(p, base))
		else if (/\.(md|mdx)$/.test(name)) {
			out.push(relative(base, p).replace(/\\/g, '/').replace(/\.(md|mdx)$/, ''))
		}
	}
	return out.sort()
}

const enPages = listDocPages(docsRoot)
const itPages = listDocPages(docsIt)
const missingItPages = enPages.filter((p) => !itPages.includes(p))
const extraItPages = itPages.filter((p) => !enPages.includes(p))
if (missingItPages.length) {
	fail(`Italian docs missing pages: ${missingItPages.join(', ')}`)
}
if (extraItPages.length) {
	fail(`Italian docs have pages without English source: ${extraItPages.join(', ')}`)
}

const distIndex = join(root, 'dist', 'index.html')
const distItIndex = join(root, 'dist', 'it', 'index.html')
if (!existsSync(distIndex)) fail('dist/index.html missing; run npm run build first')
if (!existsSync(distItIndex)) fail('dist/it/index.html missing; Italian route /it/ not built')

const enHtml = readFileSync(distIndex, 'utf8')
const itHtml = readFileSync(distItIndex, 'utf8')

const hasHreflang = (html, lang) =>
	new RegExp(
		`<link[^>]+rel=["']alternate["'][^>]+hreflang=["']${lang}["']|<link[^>]+hreflang=["']${lang}["'][^>]+rel=["']alternate["']`,
		'i',
	).test(html)

if (!hasHreflang(enHtml, 'en')) fail('dist/index.html missing hreflang=en alternate')
if (!hasHreflang(enHtml, 'it')) fail('dist/index.html missing hreflang=it alternate')
if (!hasHreflang(enHtml, 'x-default')) fail('dist/index.html missing hreflang=x-default')
if (!hasHreflang(itHtml, 'en')) fail('dist/it/index.html missing hreflang=en alternate')
if (!hasHreflang(itHtml, 'it')) fail('dist/it/index.html missing hreflang=it alternate')
if (!hasHreflang(itHtml, 'x-default')) fail('dist/it/index.html missing hreflang=x-default')

if (!/lang=["']en["']/i.test(enHtml)) fail('dist/index.html missing lang=en')
if (!/lang=["']it["']/i.test(itHtml)) fail('dist/it/index.html missing lang=it')

if (!readme.includes('## i18n') && !readme.includes('## Internationalization')) {
	fail('README must document i18n (English root + /it/ + hreflang)')
}
if (!readme.toLowerCase().includes('hreflang')) {
	fail('README must mention hreflang plan')
}
if (!pkg.scripts?.['check:hz042']) fail('package.json missing check:hz042 script')

console.log(
	`hz042_ok root_en=1 it=/it/ keys=${enKeys.length} pages=${enPages.length} hreflang=1`,
)
