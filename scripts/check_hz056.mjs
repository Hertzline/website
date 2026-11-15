#!/usr/bin/env node
/** HZ-056: CI pin / license / fork-secret hardening for Hertzline/website. */

import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CI = resolve(ROOT, ".github/workflows/ci.yml")
const META_SHA = "f4f947f31a5da82d0ca4828917490d2a1d1217b0"
const SHA40 = /@[0-9a-fA-F]{40}\b/

const fail = (msg) => {
  console.error(`FAIL ${msg}`)
  process.exit(1)
}

if (!existsSync(CI)) fail("missing .github/workflows/ci.yml")

const text = readFileSync(CI, "utf8")
const required = [
  "permissions:",
  "contents: read",
  "has-secrets: false",
  `reusable-ci.yml@${META_SHA}`,
  `meta-ref: ${META_SHA}`,
  "pin-check: true",
  "license-audit: true",
  "needs: [shared]",
  "check:hz056",
]

for (const marker of required) {
  if (!text.includes(marker)) fail(`ci.yml missing: ${marker}`)
}

if (text.includes("secrets: inherit") || /^\s*secrets:\s*$/m.test(text)) {
  fail("ci.yml must not pass secrets to jobs")
}

for (const line of text.split(/\r?\n/)) {
  const m = line.match(/^\s*uses:\s*(\S+)/)
  if (!m) continue
  const value = m[1].replace(/["']/g, "")
  if (value.startsWith("./") || value.startsWith("$/")) continue
  if (!SHA40.test(value)) fail(`unpinned uses: ${value}`)
}

console.log("check_hz056: PASS")
