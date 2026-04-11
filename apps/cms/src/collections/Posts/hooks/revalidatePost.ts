import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

const resolvePostPath = (doc: Record<string, any>): string => {
  const slug = doc.slug || ''

  if (doc.postType === 'guide') return `/guides/${slug}`
  if (doc.postType === 'event') return `/events/${slug}`
  if (doc.postType === 'itinerary') return `/itineraries/${slug}`

  return `/posts/${slug}`
}

export const revalidatePost: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context }
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = resolvePostPath(doc)
      payload.logger.info(`Revalidating post at path: ${path}`)
      revalidatePath(path)
      revalidateTag('posts-sitemap')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = resolvePostPath(previousDoc)
      payload.logger.info(`Revalidating old post at path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag('posts-sitemap')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(resolvePostPath(doc || {}))
    revalidateTag('posts-sitemap')
  }

  return doc
}
