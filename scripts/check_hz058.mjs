#!/usr/bin/env node
/** HZ-058: forbidden-claim and anti-cheat policy freeze gates (website). */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const policyPath = join(root, 'docs/HZ058_POLICY.md')
const ciPath = join(root, '.github/workflows/ci.yml')
const pkgPath = join(root, 'package.json')

if (!existsSync(policyPath)) fail('missing docs/HZ058_POLICY.md')
if (!existsSync(ciPath)) fail('missing .github/workflows/ci.yml')

const policy = readFileSync(policyPath, 'utf8')
for (const marker of [
	'Forbidden claims',
	'Anti-cheat page',
	'No injection',
	'+N FPS',
	'BattlEye',
	'Vanguard',
	'Ricochet',
	'check:hz058',
]) {
	if (!policy.includes(marker)) fail(`HZ058_POLICY.md missing marker: ${marker}`)
}

const ci = readFileSync(ciPath, 'utf8')
if (!ci.includes('check:hz058')) fail('ci.yml missing check:hz058')

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
if (!pkg.scripts?.['check:hz058']) fail('package.json missing check:hz058 script')

const banned = [
	/\+\s*\d+(\.\d+)?\s*%?\s*FPS/i,
	/\d+(\.\d+)?\s*%?\s*more\s*FPS/i,
	/guaranteed\s+.{0,24}FPS/i,
	/instant\s+.{0,24}(FPS|boost)/i,
	/average\s+FPS\s+gains?/i,
	/lorem ipsum/i,
	/"I gained \d+ FPS"/i,
]

const walk = (dir, out = []) => {
	for (const name of readdirSync(dir)) {
		if (name === 'node_modules' || name === 'dist' || name === '.git') continue
		const p = join(dir, name)
		const st = statSync(p)
		if (st.isDirectory()) walk(p, out)
		else if (/\.(mdx|md|json|astro|ts|js|mjs|css)$/i.test(name)) out.push(p)
	}
	return out
}

const files = walk(join(root, 'src'))
const hits = []
for (const file of files) {
	const text = readFileSync(file, 'utf8')
	for (const [i, line] of text.split(/\r?\n/).entries()) {
		for (const re of banned) {
			if (!re.test(line)) continue
			hits.push(`${relative(root, file)}:${i + 1}:${line.trim()}`)
			break
		}
	}
}
if (hits.length) {
	console.error('FAIL banned claim hits:')
	for (const h of hits.slice(0, 40)) console.error(' ', h)
	process.exit(1)
}

const antiCheatPages = [
	'src/content/docs/anti-cheat.mdx',
	'src/content/docs/it/anti-cheat.mdx',
]
for (const rel of antiCheatPages) {
	const p = join(root, rel)
	if (!existsSync(p)) fail(`missing ${rel}`)
	const body = readFileSync(p, 'utf8')
	const required =
		rel.includes('/it/')
			? ['injection', 'memoria', 'overlay', 'BattlEye', 'Vanguard', 'Ricochet']
			: [
					'No injection',
					'No memory reading',
					'No game file modification',
					'off by default',
					'BattlEye',
					'Vanguard',
					'Ricochet',
					'Easy Anti-Cheat',
				]
	for (const marker of required) {
		if (!body.includes(marker)) fail(`${rel} missing anti-cheat marker: ${marker}`)
	}
}

const howItWorks = [
	'src/content/docs/how-it-works.mdx',
	'src/content/docs/it/how-it-works.mdx',
]
for (const rel of howItWorks) {
	const body = readFileSync(join(root, rel), 'utf8')
	if (!/\+X FPS/i.test(body) && !/\+X\s*FPS/i.test(body)) {
		fail(`${rel} must keep the "+X FPS" forbid phrasing`)
	}
	if (!/BCDEdit/i.test(body) && !/bcdedit/i.test(body)) {
		fail(`${rel} must keep BCDEdit in the forbid list`)
	}
}

const distRequired = [
	'anti-cheat/index.html',
	'it/anti-cheat/index.html',
	'how-it-works/index.html',
	'it/how-it-works/index.html',
]
for (const rel of distRequired) {
	const p = join(root, 'dist', rel)
	if (!existsSync(p)) fail(`built page missing (run build first): dist/${rel}`)
}

console.log('check_hz058: PASS')
