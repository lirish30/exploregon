import Image from 'next/image'

import type { NormalizedMedia } from '../../lib/types'

type HomeMediaProps = {
  media: NormalizedMedia | null
  src: string | null
  altFallback: string
  className: string
  sizes: string
  priority?: boolean
}

export const HomeMedia = ({ media, src, altFallback, className, sizes, priority = false }: HomeMediaProps) => {
  if (!src) {
    return <div className={`${className} coast-home-image-fallback`} aria-hidden="true" />
  }

  return (
    <Image
      src={src}
      alt={media?.alt || altFallback}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
    />
  )
}
