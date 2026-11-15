/** HZ-059: v1.0.0 RC/release feed honesty. */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const releasesPath = join(root, 'src/data/releases.json')
const ciPath = join(root, '.github/workflows/ci.yml')
const pkgPath = join(root, 'package.json')

if (!existsSync(releasesPath)) fail('missing src/data/releases.json')
if (!existsSync(ciPath)) fail('missing .github/workflows/ci.yml')

const releases = JSON.parse(readFileSync(releasesPath, 'utf8'))
const status = releases.status

if (status === 'not_released') {
	if (releases.wingetPublished === true) fail('wingetPublished must stay false')
	if (releases.latest != null) fail('latest must be null while not_released')
	if (!Array.isArray(releases.history) || releases.history.length !== 0) {
		fail('history must be [] while not_released')
	}
	for (const os of ['windows', 'linux', 'macos']) {
		const rows = releases.artifacts?.[os]
		if (!Array.isArray(rows) || rows.length !== 0) {
			fail(`artifacts.${os} must be [] while not_released`)
		}
	}
	const notReleased = releases.ui?.en?.notReleased || ''
	if (!notReleased.includes('1.0.0')) {
		fail('ui.en.notReleased must mention RC version 1.0.0')
	}
} else if (status === 'released') {
	if (releases.latest?.version !== '1.0.0') fail('latest.version must be 1.0.0')
	const win = releases.artifacts?.windows || []
	if (!Array.isArray(win) || win.length === 0) fail('released needs windows artifacts')
	for (const row of win) {
		if (!String(row.url || '').startsWith('https://github.com/Hertzline/app/releases/')) {
			fail(`bad artifact url: ${row.url}`)
		}
		if (!/^[0-9a-f]{64}$/i.test(String(row.sha256 || ''))) fail('bad sha256')
	}
} else {
	fail(`unexpected status ${status}`)
}

const blob = JSON.stringify(releases)
for (const pat of [
	/BEGIN (?:RSA )?PRIVATE KEY/i,
	/ghp_[A-Za-z0-9]{20,}/,
	/APPLE_ID_PASSWORD/i,
	/CSC_KEY_PASSWORD/i,
]) {
	if (pat.test(blob)) fail(`secret-like pattern in releases.json: ${pat}`)
}

const ci = readFileSync(ciPath, 'utf8')
if (!ci.includes('check:hz059')) fail('ci.yml missing check:hz059')

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
if (!pkg.scripts?.['check:hz059']) fail('package.json missing check:hz059 script')

console.log(`hz059_ok status=${status} rc=1.0.0 secrets=0`)
