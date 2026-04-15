import Link from 'next/link'

import { HomeMedia } from '../home/home-media'
import type { NormalizedMedia } from '../../lib/types'

type ResolveMediaUrl = (pathOrUrl: string | null | undefined) => string | null

type CityDestinationCardProps = {
  name: string
  summary: string
  image: NormalizedMedia | null
  imageUrl?: string | null
  href: string
  badges?: string[]
  meta?: Array<{
    label: string
    value: string
  }>
  linkLabel?: string
  resolveMediaUrl?: ResolveMediaUrl
}

export const CityDestinationCard = ({
  name,
  summary,
  image,
  imageUrl,
  href,
  badges = [],
  resolveMediaUrl
}: CityDestinationCardProps) => {
  const resolvedSrc = imageUrl ?? resolveMediaUrl?.(image?.url) ?? image?.url ?? null

  return (
    <Link href={href} className="coast-home-destination-card" aria-label={`Open ${name}`}>
      <div className="coast-home-destination-media">
        <HomeMedia
          media={image}
          src={resolvedSrc}
          altFallback={name}
          className="coast-home-card-image"
          sizes="(max-width: 900px) 100vw, 25vw"
        />
      </div>
      <div className="coast-home-destination-body">
        <h3>{name}</h3>
        {badges.length ? (
          <div className="coast-home-badge-row">
            {badges.map((badge, badgeIndex) => (
              <span key={`${name}-${badge}`} className={`coast-home-badge coast-home-badge-level-${(badgeIndex % 3) + 1}`}>
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <p>{summary}</p>
      </div>
    </Link>
  )
}
