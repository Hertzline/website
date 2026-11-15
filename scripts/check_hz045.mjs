import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const dataPath = join(root, 'src/data/actions.json')
if (!existsSync(dataPath)) fail('src/data/actions.json missing (shared catalog)')

const catalog = JSON.parse(readFileSync(dataPath, 'utf8'))
if (!catalog.sharedWithDocs) fail('actions.json must set sharedWithDocs true')
if (!Array.isArray(catalog.actions) || catalog.actions.length === 0) {
	fail('actions.json must list actions')
}

const requiredIds = [
	'windows.power_plan',
	'windows.game_mode',
	'windows.hags',
	'windows.process_priority',
	'windows.background_apps',
	'windows.startup_apps',
	'windows.game_bar_capture',
	'windows.temp_shader_cleanup',
	'windows.storage_health',
	'windows.driver_check',
	'windows.display_refresh',
	'linux.feral_gamemode',
	'linux.energy_profile',
	'linux.nice_ionice',
	'linux.compositor_hint',
	'linux.mangohud',
	'linux.proton_wine_info',
	'linux.shader_cache_cleanup',
	'macos.monitor',
	'macos.game_mode_status',
	'macos.background_apps',
	'macos.low_power_mode',
	'macos.refresh_rate',
]

const byId = new Map(catalog.actions.map((a) => [a.id, a]))
for (const id of requiredIds) {
	if (!byId.has(id)) fail(`missing action id ${id}`)
}

if (catalog.actions.length !== requiredIds.length) {
	fail(
		`expected ${requiredIds.length} actions, got ${catalog.actions.length} (keep catalog 1:1 with core ACTION_IDs)`,
	)
}

const requiredAc = []
for (let i = 1; i <= 22; i++) requiredAc.push(`AC-4.${i}`)
const seenAc = new Set()
for (const action of catalog.actions) {
	for (const field of ['os', 'reversibility', 'kind', 'ac', 'en', 'it']) {
		if (action[field] == null) fail(`${action.id} missing ${field}`)
	}
	if (!['windows', 'linux', 'macos'].includes(action.os)) {
		fail(`${action.id} invalid os ${action.os}`)
	}
	if (!['reversible', 'irreversible', 'not_applicable'].includes(action.reversibility)) {
		fail(`${action.id} invalid reversibility ${action.reversibility}`)
	}
	for (const locale of ['en', 'it']) {
		const copy = action[locale]
		for (const field of ['title', 'what', 'expectedEffect', 'risk', 'howToUndo']) {
			if (!copy?.[field] || String(copy[field]).trim() === '') {
				fail(`${action.id}.${locale} missing ${field}`)
			}
		}
	}
	for (const ac of action.ac) seenAc.add(ac)
}

for (const ac of requiredAc) {
	if (!seenAc.has(ac)) fail(`catalog missing ${ac}`)
}

for (const locale of ['en', 'it']) {
	if (!catalog.localMeasurementNote?.[locale]) {
		fail(`localMeasurementNote.${locale} missing (AC-8.2 evidence)`)
	}
	if (!catalog.macosHonestyBanner?.[locale]) {
		fail(`macosHonestyBanner.${locale} missing (AC-4.23)`)
	}
	for (const key of [
		'what',
		'expectedEffect',
		'risk',
		'howToUndo',
		'reversibility',
		'evidence',
	]) {
		if (!catalog.ui?.[locale]?.[key]) fail(`ui.${locale}.${key} missing`)
	}
}

const banned = [
	/\+\s*\d+\s*%?\s*FPS/i,
	/\d+\s*%?\s*more\s*FPS/i,
	/guaranteed\s+\d+/i,
	/lorem ipsum/i,
]
const blob = JSON.stringify(catalog)
for (const re of banned) {
	if (re.test(blob)) fail(`banned marketing pattern in actions.json: ${re}`)
}

for (const rel of [
	'src/components/ActionsCatalog.astro',
	'src/content/docs/actions.mdx',
	'src/content/docs/it/actions.mdx',
]) {
	if (!existsSync(join(root, rel))) fail(`${rel} missing`)
}

const enPage = readFileSync(join(root, 'src/content/docs/actions.mdx'), 'utf8')
const itPage = readFileSync(join(root, 'src/content/docs/it/actions.mdx'), 'utf8')
if (!enPage.includes('ActionsCatalog') || !itPage.includes('ActionsCatalog')) {
	fail('actions pages must render ActionsCatalog from shared data')
}
if (!enPage.includes('actions.json') || !itPage.includes('actions.json')) {
	fail('actions pages must cite shared data file')
}

const component = readFileSync(join(root, 'src/components/ActionsCatalog.astro'), 'utf8')
if (!component.includes('../data/actions.json')) {
	fail('ActionsCatalog must import src/data/actions.json')
}
for (const field of ['what', 'risk', 'reversibility', 'evidence']) {
	if (!component.includes(field) && !component.includes(`ui.${field}`)) {
		// fields rendered via ui.* labels
	}
}
if (!component.includes('ui.what') || !component.includes('ui.risk')) {
	fail('ActionsCatalog must render what/risk fields')
}
if (!component.includes('reversibility') || !component.includes('ui.evidence')) {
	fail('ActionsCatalog must render reversibility and evidence fields')
}
if (!component.includes('macosHonestyBanner') && !component.includes('honesty')) {
	fail('ActionsCatalog must surface macOS honesty (AC-4.23)')
}

const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
if (!config.includes("slug: 'actions'") && !config.includes('slug: "actions"')) {
	fail('astro.config sidebar missing actions slug')
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!pkg.scripts?.['check:hz045']) fail('package.json missing check:hz045 script')

const dist = join(root, 'dist')
if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing; run npm run build first')
for (const rel of ['actions/index.html', 'it/actions/index.html']) {
	if (!existsSync(join(dist, rel))) fail(`built page missing: dist/${rel}`)
}

const enHtml = readFileSync(join(dist, 'actions/index.html'), 'utf8')
const itHtml = readFileSync(join(dist, 'it/actions/index.html'), 'utf8')
for (const [rel, html] of [
	['actions/index.html', enHtml],
	['it/actions/index.html', itHtml],
]) {
	if (!/<h1[\s>]/i.test(html)) fail(`dist/${rel} missing h1`)
	if (!/windows\.power_plan/.test(html)) fail(`dist/${rel} missing windows.power_plan`)
	if (!/linux\.feral_gamemode/.test(html)) fail(`dist/${rel} missing linux.feral_gamemode`)
	if (!/macos\.monitor/.test(html)) fail(`dist/${rel} missing macos.monitor`)
	if (!/AC-4\.23/i.test(html)) fail(`dist/${rel} missing AC-4.23 honesty`)
	if (/\+\s*\d+\s*%?\s*FPS/i.test(html)) fail(`dist/${rel} contains fake FPS claim`)
}

const enTitle = enHtml.match(/<title>([^<]*)<\/title>/i)?.[1] || ''
const itTitle = itHtml.match(/<title>([^<]*)<\/title>/i)?.[1] || ''
if (!/Actions/i.test(enTitle)) fail(`English actions title unexpected: ${enTitle}`)
if (!/Catalogo|Azioni/i.test(itTitle)) fail(`Italian actions title unexpected: ${itTitle}`)

console.log(
	`hz045_ok actions=${catalog.actions.length} ac=AC-4.1-4.22+4.23 locales=2 shared=1`,
)
