import Link from 'next/link'

import type { HomepageViewModel } from './homepage-view-model'
import { HomeMedia } from './home-media'

type ResolveMediaUrl = (pathOrUrl: string | null | undefined) => string | null

type SharedProps = {
  model: HomepageViewModel
  resolveMediaUrl: ResolveMediaUrl
}

export const HomepageCategoryShortcuts = ({ model }: SharedProps) => {
  return (
    <section className="section coast-home-shortcuts">
      <div className="container">
        <div className="coast-home-shortcut-grid">
          {model.categoryHighlights.map((category) => (
            <Link key={category.href} href={category.href} className="coast-home-shortcut-card">
              <span className="coast-home-shortcut-name">{category.name}</span>
              <span className="coast-home-shortcut-copy">{category.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export const HomepageDestinations = ({ model, resolveMediaUrl }: SharedProps) => {
  return (
    <section className="section coast-home-panel">
      <div className="container">
        <div className="coast-home-section-head">
          <div>
            <h2 className="coast-home-section-title">Coastal Basecamps</h2>
            <p className="coast-home-section-copy">
              Every town on the coast has its own soul. Compare vibes and find where you belong this season.
            </p>
          </div>
          <Link href="/cities" className="coast-home-section-link">
            View All Towns →
          </Link>
        </div>
        <div className="coast-home-destination-grid">
          {model.destinationStrip.map((city) => (
            <article key={city.href} className="coast-home-destination-card">
              <div className="coast-home-destination-media">
                <HomeMedia
                  media={city.image}
                  src={resolveMediaUrl(city.image?.url)}
                  altFallback={city.name}
                  className="coast-home-card-image"
                  sizes="(max-width: 900px) 100vw, 25vw"
                />
              </div>
              <div className="coast-home-destination-body">
                <h3>{city.name}</h3>
                <div className="coast-home-badge-row">
                  {city.badges.map((badge) => (
                    <span key={`${city.name}-${badge}`} className="coast-home-badge">
                      {badge}
                    </span>
                  ))}
                </div>
                <p>{city.summary}</p>
                <dl className="coast-home-meta-list">
                  {city.meta.map((item) => (
                    <div key={`${city.name}-${item.label}`}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={city.href} className="coast-home-inline-link">
                  Explore {city.name}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export const HomepageTripFinder = ({ model }: SharedProps) => {
  return (
    <section className="section">
      <div className="container">
        <div className="coast-home-trip-finder">
          <div className="coast-home-trip-copy">
            <p className="coast-home-eyebrow coast-home-eyebrow-dark">Find your ideal match</p>
            <h2 className="coast-home-section-title">{model.tripFinder.title}</h2>
            <p className="coast-home-section-copy">{model.tripFinder.intro}</p>
            <div className="coast-home-trip-actions">
              <Link href="/cities" className="button-primary">
                Browse by city
              </Link>
              <Link href="/categories" className="coast-home-outline-link coast-home-outline-link-dark">
                Compare categories
              </Link>
            </div>
          </div>
          <div className="coast-home-filter-panel">
            {model.tripFinder.filters.map((group) => (
              <div key={group.label} className="coast-home-filter-group">
                <label>{group.label}</label>
                <select defaultValue="">
                  <option value="">{group.label}</option>
                  {group.options.map((option) => (
                    <option key={`${group.label}-${option}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <Link href="/listings" className="button-primary coast-home-filter-submit">
              Explore results
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export const HomepageUtilitySnapshot = ({ model }: SharedProps) => {
  return (
    <section className="section coast-home-utility-wrap">
      <div className="container">
        <h2 className="coast-home-utility-heading">{model.utilitySnapshot.title}</h2>
        <div className="coast-home-utility-panel">
          {model.utilitySnapshot.metrics.map((metric) => (
            <article key={metric.label} className="coast-home-metric-card">
              <p className="coast-home-metric-label">{metric.label}</p>
              <strong className="coast-home-metric-value">{metric.value}</strong>
              <span className="coast-home-metric-detail">{metric.detail}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export const HomepageEditorial = ({ model, resolveMediaUrl }: SharedProps) => {
  const [leadGuide, ...moreGuides] = model.coastalPulse.guides
  const sidebarItems = [...moreGuides, ...model.coastalPulse.events].slice(0, 3)

  return (
    <section className="section coast-home-editorial">
      <div className="container">
        <div className="coast-home-pulse-header">
          <h2 className="coast-home-pulse-title">{model.coastalPulse.title}</h2>
          <nav aria-label="Editorial categories">
            <ul className="coast-home-pulse-tabs">
              <li>
                <span className="coast-home-pulse-tab coast-home-pulse-tab-active">Deep Dives</span>
              </li>
              <li>
                <span className="coast-home-pulse-tab">This Weekend</span>
              </li>
              <li>
                <span className="coast-home-pulse-tab">Local Tales</span>
              </li>
            </ul>
          </nav>
        </div>
        <div className="coast-home-editorial-grid">
          <div className="coast-home-editorial-column">
            {leadGuide && (
              <article className="coast-home-story-card coast-home-story-card-large">
                <div className="coast-home-story-media">
                  <HomeMedia
                    media={leadGuide.image}
                    src={resolveMediaUrl(leadGuide.image?.url)}
                    altFallback={leadGuide.title}
                    className="coast-home-card-image"
                    sizes="(max-width: 900px) 100vw, 55vw"
                  />
                </div>
                <div className="coast-home-story-body">
                  <p className="coast-home-story-tag">{leadGuide.eyebrow}</p>
                  <h3>{leadGuide.title}</h3>
                  <p>{leadGuide.summary}</p>
                  <Link href={leadGuide.href} className="coast-home-editorial-read-link">
                    Read the guide →
                  </Link>
                </div>
              </article>
            )}
          </div>
          <div className="coast-home-editorial-column">
            {sidebarItems.map((item) => (
              <article key={item.href} className="coast-home-story-card coast-home-story-card-compact">
                <div className="coast-home-story-media">
                  <HomeMedia
                    media={item.image}
                    src={resolveMediaUrl(item.image?.url)}
                    altFallback={item.title}
                    className="coast-home-card-image"
                    sizes="(max-width: 900px) 100vw, 25vw"
                  />
                </div>
                <div className="coast-home-story-body">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const BADGE_LABELS = ["EDITOR'S CHOICE", 'SPONSORED', 'POPULAR'] as const
const BADGE_VARIANTS = ['', 'sponsored', 'popular'] as const
const CTA_LABELS = ['View Details', 'Book a Table', 'View Details'] as const

export const HomepageListings = ({ model, resolveMediaUrl }: SharedProps) => {
  const listings = model.editorsChoice.slice(0, 3)

  return (
    <section className="section">
      <div className="container">
        <div className="coast-home-section-head coast-home-section-head-stack">
          <div>
            <h2 className="coast-home-section-title">Editor&apos;s Choice Directory</h2>
          </div>
        </div>
        <div className="coast-home-listing-grid">
          {listings.map((listing, index) => {
            const badgeVariant = BADGE_VARIANTS[index] ?? ''
            const ctaLabel = CTA_LABELS[index] ?? 'View Details'
            const isSponsored = badgeVariant === 'sponsored'

            return (
              <article key={listing.href} className="coast-home-listing-card">
                <div className="coast-home-listing-media">
                  <HomeMedia
                    media={listing.image}
                    src={resolveMediaUrl(listing.image?.url)}
                    altFallback={listing.name}
                    className="coast-home-card-image"
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                  <span
                    className={`coast-home-listing-badge${badgeVariant ? ` coast-home-listing-badge-${badgeVariant}` : ''}`}
                  >
                    {BADGE_LABELS[index]}
                  </span>
                  {/* PLACEHOLDER: static rating until CMS ratings field is wired */}
                  <span className="coast-home-listing-rating">☆ 4.8</span>
                </div>
                <div className="coast-home-listing-body">
                  <p className="coast-home-listing-meta">
                    {listing.category} · {listing.city}
                  </p>
                  <h3>{listing.name}</h3>
                </div>
                <div className="coast-home-listing-footer">
                  <Link
                    href={listing.href}
                    className={`coast-home-listing-cta${isSponsored ? ' coast-home-listing-cta-sponsored' : ''}`}
                  >
                    {ctaLabel}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const HomepagePlanningBanner = ({ model }: SharedProps) => {
  return (
    <section className="section">
      <div className="container">
        <div className="coast-home-planning-inner">
          <p className="coast-home-eyebrow coast-home-eyebrow-dark">Interactive Planning</p>
          <h2 className="coast-home-planning-title">{model.planningBanner.title}</h2>
          <p className="coast-home-planning-copy">{model.planningBanner.body}</p>
          <div className="coast-home-planning-actions">
            <Link href={model.planningBanner.button.href} className="button-primary">
              {model.planningBanner.button.label}
            </Link>
            <Link href="/itineraries" className="button-secondary">
              See Example Itineraries
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
