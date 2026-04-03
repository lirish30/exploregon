import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')
const sitemapPath = resolve(repoRoot, 'files/exploregoncoast_sitemap_outline.xml')

const routeChecks = [
  { file: 'apps/web/src/app/page.tsx', sitemapFamilies: ['/'] },
  { file: 'apps/web/src/app/cities/page.tsx', sitemapFamilies: ['/cities'] },
  { file: 'apps/web/src/app/cities/[slug]/page.tsx', sitemapFamilies: ['/cities/'] },
  {
    file: 'apps/web/src/app/categories/page.tsx',
    sitemapFamilies: ['/stay/', '/do/', '/plan/', '/nature/', '/live/']
  },
  {
    file: 'apps/web/src/app/categories/[slug]/page.tsx',
    sitemapFamilies: ['/stay/', '/do/', '/plan/', '/nature/', '/live/']
  },
  { file: 'apps/web/src/app/listings/[slug]/page.tsx', sitemapFamilies: ['/listings/'] },
  {
    file: 'apps/web/src/app/guides/page.tsx',
    sitemapFamilies: ['/stay/', '/do/', '/plan/', '/nature/', '/live/', '/news/']
  },
  {
    file: 'apps/web/src/app/guides/[slug]/page.tsx',
    sitemapFamilies: ['/stay/', '/do/', '/plan/', '/nature/', '/live/', '/news/']
  },
  { file: 'apps/web/src/app/events/page.tsx', sitemapFamilies: ['/events'] },
  { file: 'apps/web/src/app/events/[slug]/page.tsx', sitemapFamilies: ['/events/'] },
  { file: 'apps/web/src/app/itineraries/page.tsx', sitemapFamilies: ['/plan/itineraries/', '/trip-builder/'] },
  { file: 'apps/web/src/app/itineraries/[slug]/page.tsx', sitemapFamilies: ['/plan/itineraries/'] }
]

const xml = readFileSync(sitemapPath, 'utf8')
const urls = [...xml.matchAll(/<loc>https:\/\/exploregoncoast\.com([^<]*)<\/loc>/g)].map((match) => match[1] || '/')

const hasMetadataExport = (fileContent) =>
  fileContent.includes('export async function generateMetadata') || fileContent.includes('export const metadata:')

const results = routeChecks.map((check) => {
  const routeFilePath = resolve(repoRoot, check.file)
  const fileContent = readFileSync(routeFilePath, 'utf8')

  const inSitemap = check.sitemapFamilies.some((family) => {
    if (family.endsWith('/')) {
      return urls.some((url) => url.startsWith(family))
    }

    const withTrailingSlash = `${family}/`
    return urls.includes(family) || urls.includes(withTrailingSlash)
  })

  const metadataCovered = hasMetadataExport(fileContent)

  return {
    ...check,
    inSitemap,
    metadataCovered,
    ok: inSitemap && metadataCovered
  }
})

let hasFailure = false
for (const result of results) {
  const line = `${result.ok ? 'OK' : 'FAIL'} ${result.file} | sitemap:${result.inSitemap} metadata:${result.metadataCovered}`
  console.log(line)
  if (!result.ok) {
    hasFailure = true
  }
}

if (hasFailure) {
  process.exitCode = 1
}
