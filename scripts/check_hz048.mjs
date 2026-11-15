import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

// Required /docs/ slugs from HZ-047; Italian parity is the HZ-048 gate.
const requiredSlugs = [
	'docs',
	'docs/getting-started',
	'docs/installation',
	'docs/first-benchmark',
	'docs/profiles',
	'docs/actions',
	'docs/rollback',
	'docs/troubleshooting',
	'docs/faq',
	'docs/building-from-source',
	'docs/contributing',
	'docs/architecture',
	'docs/security',
]

const expectedItTitles = {
	docs: 'Documentazione',
	'docs/getting-started': 'Per iniziare',
	'docs/installation': 'Installazione',
	'docs/first-benchmark': 'Primo benchmark',
	'docs/profiles': 'Profili',
	'docs/actions': 'Azioni',
	'docs/rollback': 'Rollback e sicurezza',
	'docs/troubleshooting': 'Risoluzione problemi',
	'docs/faq': 'FAQ',
	'docs/building-from-source': 'Compilare dal sorgente',
	'docs/contributing': 'Contribuire',
	'docs/architecture': 'Architettura',
	'docs/security': 'Sicurezza',
}

const slugToFile = (slug) => {
	if (slug === 'docs') return 'docs/index.mdx'
	return `${slug}.mdx`
}

const frontmatter = (src) => {
	const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
	if (!m) return {}
	const out = {}
	for (const line of m[1].split(/\r?\n/)) {
		const kv = line.match(/^(\w+):\s*(.*)$/)
		if (!kv) continue
		out[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim()
	}
	return out
}

const bodyText = (src) => {
	const stripped = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
	return stripped.replace(/import\s+.+$/gm, '').trim()
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

const docsRoot = join(root, 'src/content/docs')
const docsIt = join(docsRoot, 'it')
if (!existsSync(docsIt)) fail('src/content/docs/it/ missing')

// --- missing-page gate: every English docs page has an Italian twin ---
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

// --- required docs set: file + translated title + non-empty body ---
for (const slug of requiredSlugs) {
	const rel = slugToFile(slug)
	const enPath = join(docsRoot, rel)
	const itPath = join(docsIt, rel)
	if (!existsSync(enPath)) fail(`missing English page src/content/docs/${rel}`)
	if (!existsSync(itPath)) fail(`missing Italian page src/content/docs/it/${rel}`)

	const enSrc = readFileSync(enPath, 'utf8')
	const itSrc = readFileSync(itPath, 'utf8')
	const enFm = frontmatter(enSrc)
	const itFm = frontmatter(itSrc)

	if (!itFm.title) fail(`Italian ${rel} missing title frontmatter`)
	if (!itFm.description) fail(`Italian ${rel} missing description frontmatter`)
	if (!bodyText(itSrc)) fail(`Italian ${rel} has empty body`)

	const expected = expectedItTitles[slug]
	if (expected && itFm.title !== expected) {
		fail(`Italian ${rel} title expected "${expected}", got "${itFm.title}"`)
	}
	if (enFm.title && itFm.title === enFm.title && slug !== 'docs/faq') {
		fail(`Italian ${rel} title still English ("${itFm.title}"); translate it`)
	}
	if (enFm.description && itFm.description === enFm.description) {
		fail(`Italian ${rel} description identical to English; translate it`)
	}

	// Italian in-tree links must not point at English /docs/ (missing locale).
	const badLinks = [...itSrc.matchAll(/\]\((\/docs\/[^)]*)\)/g)].map((m) => m[1])
	if (badLinks.length) {
		fail(`Italian ${rel} links to English /docs/ paths: ${badLinks.join(', ')} (use /it/docs/)`)
	}
}

// --- missing-key gate: custom i18n dictionaries ---
const enPath = join(root, 'src/content/i18n/en.json')
const itPath = join(root, 'src/content/i18n/it.json')
if (!existsSync(enPath)) fail('src/content/i18n/en.json missing')
if (!existsSync(itPath)) fail('src/content/i18n/it.json missing')
const en = JSON.parse(readFileSync(enPath, 'utf8'))
const it = JSON.parse(readFileSync(itPath, 'utf8'))
const enKeys = Object.keys(en).sort()
const itKeys = Object.keys(it).sort()
const missingInIt = enKeys.filter((k) => !(k in it))
const missingInEn = itKeys.filter((k) => !(k in en))
if (missingInIt.length) fail(`it.json missing keys: ${missingInIt.join(', ')}`)
if (missingInEn.length) fail(`en.json missing keys: ${missingInEn.join(', ')}`)
for (const key of enKeys) {
	if (typeof it[key] !== 'string' || it[key].trim() === '') {
		fail(`it.json empty value for ${key}`)
	}
	if (it[key] === en[key]) {
		fail(`it.json value for ${key} identical to English; translate it`)
	}
}

// --- Italian install + actions content ---
const itInstall = readFileSync(join(docsIt, 'docs/installation.mdx'), 'utf8')
for (const os of ['Windows', 'Linux', 'macOS']) {
	if (!itInstall.includes(os)) fail(`Italian docs/installation missing ${os} section`)
}
if (!itInstall.includes('Hertzline.Hertzline')) {
	fail('Italian docs/installation must document winget Hertzline.Hertzline')
}

const itActions = readFileSync(join(docsIt, 'docs/actions.mdx'), 'utf8')
if (!itActions.includes('ActionsCatalog')) {
	fail('Italian docs/actions must render ActionsCatalog')
}
if (!itActions.includes('actions.json')) {
	fail('Italian docs/actions must cite shared actions.json')
}
if (!itActions.includes('locale="it"') && !itActions.includes("locale='it'")) {
	fail('Italian docs/actions must pass locale="it" to ActionsCatalog')
}

const acMarkers = ['AC-1', 'AC-2', 'AC-3', 'AC-4', 'AC-5', 'AC-6', 'AC-7', 'AC-8']
const itDocsBlob = requiredSlugs
	.map((slug) => readFileSync(join(docsIt, slugToFile(slug)), 'utf8'))
	.join('\n')
for (const ac of acMarkers) {
	if (!itDocsBlob.includes(ac)) fail(`Italian docs set missing ${ac} coverage marker`)
}

const banned = [/\+\s*\d+\s*%?\s*FPS/i, /\d+\s*%?\s*more\s*FPS/i, /lorem ipsum/i]
for (const slug of requiredSlugs) {
	const rel = slugToFile(slug)
	const blob = readFileSync(join(docsIt, rel), 'utf8')
	for (const re of banned) {
		if (re.test(blob)) fail(`banned pattern in Italian ${rel}: ${re}`)
	}
}

// --- sidebar Italian translations for Documentation ---
const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
if (!config.includes("it: 'Documentazione'") && !config.includes('it: "Documentazione"')) {
	fail('astro.config Documentation group missing translations.it Documentazione')
}
for (const slug of requiredSlugs) {
	const label = expectedItTitles[slug]
	if (!label) continue
	if (!config.includes(`it: '${label}'`) && !config.includes(`it: "${label}"`)) {
		fail(`astro.config sidebar missing Italian label "${label}" for ${slug}`)
	}
}

// --- built /it/docs/ pages ---
const dist = join(root, 'dist')
if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing; run npm run build first')

const distPaths = requiredSlugs.map((slug) => {
	if (slug === 'docs') return 'it/docs/index.html'
	return `it/${slug}/index.html`
})
for (const rel of distPaths) {
	if (!existsSync(join(dist, rel))) fail(`built Italian page missing: dist/${rel}`)
}

const itDocsActionsHtml = readFileSync(join(dist, 'it/docs/actions/index.html'), 'utf8')
if (!/windows\.power_plan/.test(itDocsActionsHtml)) {
	fail('dist/it/docs/actions missing windows.power_plan from shared catalog')
}
if (!/linux\.feral_gamemode/.test(itDocsActionsHtml)) {
	fail('dist/it/docs/actions missing linux.feral_gamemode')
}
if (!/macos\.monitor/.test(itDocsActionsHtml)) {
	fail('dist/it/docs/actions missing macos.monitor')
}
if (!/lang=["']it["']/i.test(itDocsActionsHtml)) {
	fail('dist/it/docs/actions missing lang=it')
}
if (/\+\s*\d+\s*%?\s*FPS/i.test(itDocsActionsHtml)) {
	fail('dist/it/docs/actions contains fake FPS claim')
}

const itInstallHtml = readFileSync(join(dist, 'it/docs/installation/index.html'), 'utf8')
if (!/Windows/i.test(itInstallHtml) || !/Linux/i.test(itInstallHtml) || !/macOS/i.test(itInstallHtml)) {
	fail('dist/it/docs/installation missing per-OS coverage')
}
if (!/Hertzline\.Hertzline/.test(itInstallHtml)) {
	fail('dist/it/docs/installation missing winget Hertzline.Hertzline')
}

// --- wiring ---
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!pkg.scripts?.['check:hz048']) fail('package.json missing check:hz048 script')

const ci = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8')
if (!ci.includes('check:hz048')) fail('ci.yml must run check:hz048')

const readme = readFileSync(join(root, 'README.md'), 'utf8')
if (!readme.includes('check:hz048')) fail('README must document check:hz048')

console.log(
	`hz048_ok it_docs=${requiredSlugs.length} it_pages=${itPages.length} i18n_keys=${enKeys.length} built=/it/docs/`,
)
