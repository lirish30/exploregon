import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

const resolvePath = (doc: Record<string, any>): string => {
  const type = doc.pageType
  const slug = doc.slug || ''

  if (!slug || slug === 'home' || type === 'home') {
    return '/'
  }

  if (type === 'city') return `/cities/${slug}`
  if (type === 'region') return `/regions/${slug}`
  if (type === 'listing') return `/listings/${slug}`

  return `/${slug}`
}

export const revalidatePage: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context }
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = resolvePath(doc)
      payload.logger.info(`Revalidating page at path: ${path}`)
      revalidatePath(path)
      revalidateTag('pages-sitemap')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = resolvePath(previousDoc)
      payload.logger.info(`Revalidating old page at path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag('pages-sitemap')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(resolvePath(doc || {}))
    revalidateTag('pages-sitemap')
  }

  return doc
}
