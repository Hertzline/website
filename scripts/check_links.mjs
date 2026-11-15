import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { LinkChecker } from 'linkinator'

const root = process.cwd()
const dist = join(root, 'dist')

const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

if (!existsSync(join(dist, 'index.html'))) {
	fail('dist/index.html missing; run npm run build first')
}

// Placeholder site URL must not be fetched (DNS will fail until owner sets domain).
const skip = [/hertzline\.example/i]

const checker = new LinkChecker()
const result = await checker.check({
	path: dist,
	recurse: true,
	cleanUrls: true,
	linksToSkip: skip,
})

const broken = result.links.filter((l) => l.state === 'BROKEN')
if (broken.length) {
	for (const link of broken) {
		console.error(`BROKEN ${link.status} ${link.url} (from ${link.parent || 'seed'})`)
	}
	fail(`link check found ${broken.length} broken link(s)`)
}

const ok = result.links.filter((l) => l.state === 'OK').length
const skipped = result.links.filter((l) => l.state === 'SKIPPED').length
console.log(`hz043_links_ok checked=${result.links.length} ok=${ok} skipped=${skipped}`)
