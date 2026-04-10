import assert from 'node:assert/strict'
import test, { afterEach } from 'node:test'

import { getPageBySlug } from './api'

const originalFetch = global.fetch
const originalPayloadServerUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL

afterEach(() => {
  global.fetch = originalFetch
  process.env.PAYLOAD_PUBLIC_SERVER_URL = originalPayloadServerUrl
})

const toFindResponse = <T>(docs: T[]) => ({
  docs,
  totalDocs: docs.length,
  limit: 1,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null
})

test('getPageBySlug fetches published page records and normalizes response', async () => {
  process.env.PAYLOAD_PUBLIC_SERVER_URL = 'http://cms.local'
  let requestedUrl = ''

  global.fetch = (async (input: string | URL | Request) => {
    requestedUrl = String(input)

    return new Response(
      JSON.stringify(
        toFindResponse([
          {
            id: 1,
            title: 'Map',
            slug: 'map',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [{ type: 'text', version: 1, text: 'Hello coast' }]
                  }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1
              }
            },
            seoTitle: 'Map Title',
            seoDescription: 'Map Description',
            status: 'published',
            updatedAt: '2026-04-10T00:00:00.000Z',
            createdAt: '2026-04-09T00:00:00.000Z'
          }
        ])
      ),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  }) as typeof fetch

  const page = await getPageBySlug('map', { revalidate: false })

  assert.equal(page?.slug, 'map')
  assert.equal(page?.title, 'Map')
  assert.equal(page?.seo.title, 'Map Title')
  assert.equal(page?.seo.description, 'Map Description')
  assert.match(requestedUrl, /\/api\/pages\?/)
  assert.match(requestedUrl, /where%5Bslug%5D%5Bequals%5D=map/)
  assert.match(requestedUrl, /where%5Bstatus%5D%5Bequals%5D=published/)
})

test('getPageBySlug returns null for invalid slug input and skips fetch', async () => {
  let callCount = 0
  global.fetch = (async () => {
    callCount += 1
    return new Response(JSON.stringify(toFindResponse([])), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  }) as typeof fetch

  const page = await getPageBySlug(['map'])

  assert.equal(page, null)
  assert.equal(callCount, 0)
})
