import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'

const stylesPath = new URL('./styles.css', import.meta.url)
const styles = fs.readFileSync(stylesPath, 'utf8')

test('sitewide hero sections offset for transparent header', () => {
  assert.match(styles, /--site-header-height:\s*4\.2rem;/)
  assert.match(styles, /\.page-hero,\s*[\s\S]*?\.coast-home-hero\s*\{[\s\S]*?margin-top:\s*calc\(var\(--site-header-height\)\s*\*\s*-1\);[\s\S]*?padding-top:\s*var\(--site-header-height\);/)
})
