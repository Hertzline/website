import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const requiredSlugs = ['index', 'how-it-works', 'anti-cheat', 'privacy', 'changelog']
const requiredDistPaths = [
	'index.html',
	'how-it-works/index.html',
	'anti-cheat/index.html',
	'privacy/index.html',
	'changelog/index.html',
	'it/index.html',
	'it/how-it-works/index.html',
	'it/anti-cheat/index.html',
	'it/privacy/index.html',
	'it/changelog/index.html',
]

const docsRoot = join(root, 'src/content/docs')
const docsIt = join(docsRoot, 'it')

for (const slug of requiredSlugs) {
	const en = join(docsRoot, `${slug}.mdx`)
	const it = join(docsIt, `${slug}.mdx`)
	if (!existsSync(en)) fail(`missing English page src/content/docs/${slug}.mdx`)
	if (!existsSync(it)) fail(`missing Italian page src/content/docs/it/${slug}.mdx`)
}

const parseFrontmatter = (file) => {
	const raw = readFileSync(file, 'utf8')
	if (!raw.startsWith('---')) fail(`${relative(root, file)} missing frontmatter`)
	const end = raw.indexOf('\n---', 3)
	if (end < 0) fail(`${relative(root, file)} unclosed frontmatter`)
	const fm = raw.slice(3, end)
	const title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '')
	const description = fm
		.match(/^description:\s*(.+)$/m)?.[1]
		?.trim()
		.replace(/^["']|["']$/g, '')
	if (!title) fail(`${relative(root, file)} missing title`)
	if (!description) fail(`${relative(root, file)} missing description`)
	return { title, description, body: raw.slice(end + 4) }
}

const enMeta = []
const itMeta = []
for (const slug of requiredSlugs) {
	enMeta.push({ slug, ...parseFrontmatter(join(docsRoot, `${slug}.mdx`)) })
	itMeta.push({ slug, ...parseFrontmatter(join(docsIt, `${slug}.mdx`)) })
}

const uniqueOrFail = (items, field, locale) => {
	const seen = new Map()
	for (const item of items) {
		const value = item[field]
		if (seen.has(value)) {
			fail(`${locale} duplicate ${field}: "${value}" (${seen.get(value)} and ${item.slug})`)
		}
		seen.set(value, item.slug)
	}
}

uniqueOrFail(enMeta, 'title', 'en')
uniqueOrFail(enMeta, 'description', 'en')
// Italian may share Privacy title with English brand term; require unique descriptions.
uniqueOrFail(itMeta, 'description', 'it')
const itTitles = itMeta.map((m) => m.title)
if (new Set(itTitles).size !== itTitles.length) {
	const dupes = itTitles.filter((t, i) => itTitles.indexOf(t) !== i)
	// Allow exact "Privacy" / "Hertzline" / "Changelog" brand reuse only if descriptions differ (already checked).
	const blocked = dupes.filter((t) => !['Privacy', 'Hertzline', 'Changelog'].includes(t))
	if (blocked.length) fail(`it duplicate titles not brand-shared: ${blocked.join(', ')}`)
}

const banned = [
	/\+\s*\d+\s*%?\s*FPS/i,
	/\d+\s*%?\s*more\s*FPS/i,
	/guaranteed\s+\d+/i,
	/fake\s+testimonial/i,
	/lorem ipsum/i,
	/"I gained \d+ FPS"/i,
]

const allBodies = [...enMeta, ...itMeta].map((m) => m.body).join('\n')
for (const re of banned) {
	if (re.test(allBodies)) fail(`banned marketing pattern found: ${re}`)
}

if (!existsSync(join(root, 'src/assets/ui-preview-placeholder.svg'))) {
	fail('labeled UI preview placeholder SVG missing')
}
const placeholder = readFileSync(join(root, 'src/assets/ui-preview-placeholder.svg'), 'utf8')
if (!/Placeholder/i.test(placeholder) && !/placeholder/i.test(placeholder)) {
	fail('placeholder SVG must be labeled as placeholder')
}

const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
if (!config.includes('product-pages.css')) fail('astro.config must include product-pages.css')
for (const slug of ['how-it-works', 'anti-cheat', 'privacy', 'changelog']) {
	if (!config.includes(`slug: '${slug}'`) && !config.includes(`slug: "${slug}"`)) {
		fail(`astro.config sidebar missing slug ${slug}`)
	}
}

const dist = join(root, 'dist')
if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing; run npm run build first')

for (const rel of requiredDistPaths) {
	if (!existsSync(join(dist, rel))) fail(`built page missing: dist/${rel}`)
}

const extractTitle = (html) => {
	const m = html.match(/<title>([^<]*)<\/title>/i)
	return m?.[1]?.trim() || ''
}
const extractDesc = (html) => {
	const m = html.match(
		/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
	) || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i)
	return m?.[1]?.trim() || ''
}

const builtTitles = []
const builtDescs = []
for (const rel of [
	'index.html',
	'how-it-works/index.html',
	'anti-cheat/index.html',
	'privacy/index.html',
	'changelog/index.html',
]) {
	const html = readFileSync(join(dist, rel), 'utf8')
	const title = extractTitle(html)
	const desc = extractDesc(html)
	if (!title) fail(`dist/${rel} missing <title>`)
	if (!desc) fail(`dist/${rel} missing meta description`)
	builtTitles.push(title)
	builtDescs.push(desc)
	if (!/<h1[\s>]/i.test(html)) fail(`dist/${rel} missing h1`)
}

if (new Set(builtTitles).size !== builtTitles.length) {
	fail(`built English titles not unique: ${builtTitles.join(' | ')}`)
}
if (new Set(builtDescs).size !== builtDescs.length) {
	fail(`built English descriptions not unique: ${builtDescs.join(' | ')}`)
}

const home = readFileSync(join(dist, 'index.html'), 'utf8')
if (!/placeholder/i.test(home)) fail('home must label placeholder imagery')
const changelogHtml = readFileSync(join(dist, 'changelog/index.html'), 'utf8')
const releases = JSON.parse(readFileSync(join(root, 'src/data/releases.json'), 'utf8'))
if (releases.status === 'not_released') {
	if (!/Not released yet|not released yet|Downloads are not released/i.test(changelogHtml)) {
		fail('changelog must state not released yet')
	}
} else if (!/1\.0\.0/.test(changelogHtml)) {
	fail('changelog must mention released version 1.0.0')
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!pkg.scripts?.['check:hz044']) fail('package.json missing check:hz044 script')

const productCss = join(root, 'src/styles/product-pages.css')
if (!existsSync(productCss)) fail('product-pages.css missing')
if (!readFileSync(productCss, 'utf8').includes('prefers-reduced-motion')) {
	fail('product-pages.css must respect prefers-reduced-motion')
}

console.log(
	`hz044_ok pages=${requiredSlugs.length} locales=2 unique_meta=1 placeholder=1 no_fake_fps=1`,
)
