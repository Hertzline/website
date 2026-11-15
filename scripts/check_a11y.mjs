import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')

const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

if (!existsSync(join(dist, 'index.html'))) {
	fail('dist/index.html missing; run npm run build first')
}

const listHtml = (dir, out = []) => {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name)
		if (statSync(p).isDirectory()) {
			if (name === 'pagefind' || name === '_astro') continue
			listHtml(p, out)
		} else if (name.endsWith('.html')) {
			out.push(p)
		}
	}
	return out
}

const pages = listHtml(dist)
if (!pages.length) fail('no HTML pages under dist/')

const violations = []

for (const file of pages) {
	const rel = relative(dist, file).replace(/\\/g, '/')
	const html = readFileSync(file, 'utf8')

	if (!/<html[^>]*\slang=["'][^"']+["']/i.test(html)) {
		violations.push(`${rel}: missing html lang`)
	}
	if (!/<title>[^<]+<\/title>/i.test(html)) {
		violations.push(`${rel}: missing or empty title`)
	}
	if (!/<h1[\s>]/i.test(html)) {
		violations.push(`${rel}: missing h1`)
	}

	const imgs = [...html.matchAll(/<img\b([^>]*)>/gi)]
	for (const m of imgs) {
		const attrs = m[1]
		if (/aria-hidden=["']true["']/i.test(attrs)) continue
		if (!/\balt=/i.test(attrs)) {
			violations.push(`${rel}: img without alt`)
		}
	}
}

if (violations.length) {
	for (const v of violations) console.error(v)
	fail(`a11y structural check found ${violations.length} issue(s)`)
}

console.log(`hz043_a11y_ok pages=${pages.length} structural=pass`)
