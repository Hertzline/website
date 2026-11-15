// Lighthouse CI (HZ-043). Mobile form factor is Lighthouse default.
// Official: https://github.com/GoogleChrome/lighthouse-ci/blob/v0.16.1/docs/configuration.md
// Pins: @lhci/cli 0.16.1 (Apache-2.0) bundles lighthouse 13.6.0.
module.exports = {
	ci: {
		collect: {
			staticDistDir: './dist',
			url: ['http://localhost/', 'http://localhost/it/'],
			numberOfRuns: 1,
			settings: {
				// Explicit mobile; do not use preset:desktop.
				formFactor: 'mobile',
				screenEmulation: {
					mobile: true,
					width: 412,
					height: 823,
					deviceScaleFactor: 1.75,
					disabled: false,
				},
				// GHA Linux Chrome needs no-sandbox (runner runs as root-like).
				chromeFlags: '--no-sandbox --disable-dev-shm-usage',
			},
		},
		assert: {
			assertions: {
				'categories:performance': ['error', { minScore: 0.95 }],
				'categories:accessibility': ['error', { minScore: 0.95 }],
				'categories:best-practices': ['error', { minScore: 0.95 }],
				'categories:seo': ['error', { minScore: 0.95 }],
			},
		},
		upload: {
			target: 'filesystem',
			outputDir: './.lighthouseci',
		},
	},
}
