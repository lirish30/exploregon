import Image from 'next/image'

type HeroBackgroundProps = {
  src: string | null
  alt: string
  priority?: boolean
}

export const HeroBackground = ({ src, alt, priority = true }: HeroBackgroundProps) => {
  if (!src) {
    return null
  }

  return (
    <div className="entity-hero-media" aria-hidden="true">
      <Image
        src={src}
        alt={alt}
        fill
        className="entity-hero-image"
        sizes="100vw"
        priority={priority}
      />
    </div>
  )
}
