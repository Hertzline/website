import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
const readme = readFileSync(join(root, 'README.md'), 'utf8')

const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

if (pkg.engines?.node !== '>=22.23.4') {
	fail(`engines.node must be >=22.23.4, got ${pkg.engines?.node}`)
}

for (const [name, want] of [
	['astro', '7.4.12'],
	['@astrojs/starlight', '0.43.1'],
	['sharp', '0.35.5'],
]) {
	const got = pkg.dependencies?.[name]
	if (got !== want) fail(`${name} must be pinned to ${want}, got ${got}`)
}

if (!config.includes("output: 'static'") && !config.includes('output: "static"')) {
	fail('astro.config must set output: static')
}

if (!config.includes('hertzline.example')) {
	fail('astro.config must include placeholder site URL hertzline.example')
}

if (/^\s*adapter\s*:/m.test(config) || /from\s+['"]@astrojs\/vercel['"]/.test(config)) {
	fail('astro.config must not install a server adapter')
}

if (!readme.includes('## Deploy on Vercel')) {
	fail('README must include Deploy on Vercel section')
}

const dist = join(root, 'dist')
if (!existsSync(dist) || !existsSync(join(dist, 'index.html'))) {
	fail('dist/index.html missing; run npm run build first')
}

const walk = (dir) => {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name)
		if (statSync(p).isDirectory()) walk(p)
		else if (name.endsWith('.js') || name.endsWith('.mjs') || name.endsWith('.html')) {
			const text = readFileSync(p, 'utf8')
			if (text.includes('astro:server') || text.includes('@astrojs/vercel')) {
				fail(`server marker in ${p}`)
			}
		}
	}
}
walk(dist)

console.log('hz040_ok static=1 site_placeholder=1 engines=ok pins=ok vercel_docs=1')
