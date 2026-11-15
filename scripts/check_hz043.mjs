import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const readme = readFileSync(join(root, 'README.md'), 'utf8')
const ci = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8')
const lhci = readFileSync(join(root, 'lighthouserc.cjs'), 'utf8')

for (const script of [
	'check:hz043',
	'check:links',
	'check:a11y',
	'check:lhci',
	'check:hz042',
]) {
	if (!pkg.scripts?.[script]) fail(`package.json missing script ${script}`)
}

if (pkg.devDependencies?.linkinator !== '8.1.0') {
	fail(`linkinator must be pinned to 8.1.0, got ${pkg.devDependencies?.linkinator}`)
}
if (pkg.devDependencies?.['@lhci/cli'] !== '0.16.1') {
	fail(`@lhci/cli must be pinned to 0.16.1, got ${pkg.devDependencies?.['@lhci/cli']}`)
}

if (!existsSync(join(root, 'scripts/check_links.mjs'))) fail('scripts/check_links.mjs missing')
if (!existsSync(join(root, 'scripts/check_a11y.mjs'))) fail('scripts/check_a11y.mjs missing')
if (!existsSync(join(root, 'lighthouserc.cjs'))) fail('lighthouserc.cjs missing')

if (!lhci.includes("staticDistDir: './dist'") && !lhci.includes('staticDistDir: "./dist"')) {
	fail('lighthouserc.cjs must set staticDistDir to ./dist')
}
if (!lhci.includes("formFactor: 'mobile'") && !lhci.includes('formFactor: "mobile"')) {
	fail('lighthouserc.cjs must set mobile formFactor')
}
for (const cat of ['performance', 'accessibility', 'best-practices', 'seo']) {
	if (!lhci.includes(`categories:${cat}`)) {
		fail(`lighthouserc.cjs missing assertion categories:${cat}`)
	}
}
if (!lhci.includes('minScore: 0.95')) {
	fail('lighthouserc.cjs must assert minScore 0.95')
}

if (!ci.includes('check:links')) fail('ci.yml must run check:links')
if (!ci.includes('check:a11y')) fail('ci.yml must run check:a11y')
if (!ci.includes('check:lhci') && !ci.includes('lhci autorun')) {
	fail('ci.yml must run Lighthouse CI')
}
if (!ci.includes('check:hz042')) fail('ci.yml must keep missing-translation check:hz042')
if (!ci.includes('check:hz043')) fail('ci.yml must run check:hz043')

if (!readme.toLowerCase().includes('lighthouse')) {
	fail('README must document Lighthouse CI')
}
if (!readme.toLowerCase().includes('link')) {
	fail('README must document link checks')
}

if (!existsSync(join(root, 'dist', 'index.html'))) {
	fail('dist/index.html missing; run npm run build before check:hz043')
}

console.log('hz043_ok links=wired a11y=wired lhci=mobile>=95 i18n=hz042 ci=wired')
