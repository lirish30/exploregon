import Link from 'next/link'

import { HomeMedia } from '../home/home-media'
import type { NormalizedMedia } from '../../lib/types'

type ResolveMediaUrl = (pathOrUrl: string | null | undefined) => string | null

type CityDestinationCardProps = {
  name: string
  summary: string
  image: NormalizedMedia | null
  href: string
  badges?: string[]
  meta?: Array<{
    label: string
    value: string
  }>
  linkLabel?: string
  resolveMediaUrl: ResolveMediaUrl
}

export const CityDestinationCard = ({
  name,
  summary,
  image,
  href,
  badges = [],
  meta = [],
  linkLabel,
  resolveMediaUrl
}: CityDestinationCardProps) => {
  return (
    <article className="coast-home-destination-card">
      <div className="coast-home-destination-media">
        <HomeMedia
          media={image}
          src={resolveMediaUrl(image?.url)}
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
        {meta.length ? (
          <dl className="coast-home-meta-list">
            {meta.map((item) => (
              <div key={`${name}-${item.label}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <Link href={href} className="coast-home-inline-link">
          {linkLabel ?? `Explore ${name}`}
        </Link>
      </div>
    </article>
  )
}
