import Link from 'next/link'

import type { HomepageViewModel } from './homepage-view-model'
import { HomeMedia } from './home-media'
import { PhosphorIcon } from './phosphor-icon'

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
              {category.icon && (
                <span className="coast-home-shortcut-icon">
                  <PhosphorIcon name={category.icon} />
                </span>
              )}
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
            <p className="coast-home-eyebrow coast-home-eyebrow-dark">Coastal Basecamps</p>
            <h2 className="coast-home-section-title">Every town has a different rhythm.</h2>
            <p className="coast-home-section-copy">
              Compare launch cities by vibe, access, and what kind of coast weekend they support best.
            </p>
          </div>
          <Link href="/cities" className="coast-home-section-link">
            View all towns
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
      <div className="container coast-home-utility-grid">
        <div className="coast-home-utility-copy">
          <p className="coast-home-eyebrow coast-home-eyebrow-dark">Coastal planning dashboard</p>
          <h2 className="coast-home-section-title">{model.utilitySnapshot.title}</h2>
          <p className="coast-home-section-copy">{model.utilitySnapshot.intro}</p>
          <div className="coast-home-trip-actions">
            <Link href={model.utilitySnapshot.primaryLink.href} className="button-primary">
              {model.utilitySnapshot.primaryLink.label}
            </Link>
            <Link href={model.utilitySnapshot.secondaryLink.href} className="coast-home-outline-link coast-home-outline-link-dark">
              {model.utilitySnapshot.secondaryLink.label}
            </Link>
          </div>
        </div>
        <aside className="coast-home-utility-panel">
          {model.utilitySnapshot.metrics.map((metric) => (
            <article key={metric.label} className="coast-home-metric-card">
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <span>{metric.detail}</span>
            </article>
          ))}
        </aside>
      </div>
    </section>
  )
}

export const HomepageEditorial = ({ model, resolveMediaUrl }: SharedProps) => {
  return (
    <section className="section coast-home-editorial">
      <div className="container">
        <div className="coast-home-section-head coast-home-section-head-stack">
          <div>
            <p className="coast-home-eyebrow coast-home-eyebrow-dark">Editor&apos;s Choice Weekly</p>
            <h2 className="coast-home-section-title">{model.coastalPulse.title}</h2>
            <p className="coast-home-section-copy">{model.coastalPulse.intro}</p>
          </div>
        </div>
        <div className="coast-home-editorial-grid">
          <div className="coast-home-editorial-column">
            {model.coastalPulse.guides.map((guide) => (
              <article key={guide.href} className="coast-home-story-card coast-home-story-card-large">
                <div className="coast-home-story-media">
                  <HomeMedia
                    media={guide.image}
                    src={resolveMediaUrl(guide.image?.url)}
                    altFallback={guide.title}
                    className="coast-home-card-image"
                    sizes="(max-width: 900px) 100vw, 50vw"
                  />
                </div>
                <div className="coast-home-story-body">
                  <p className="coast-home-story-tag">{guide.eyebrow}</p>
                  <h3>{guide.title}</h3>
                  <p>{guide.summary}</p>
                  <Link href={guide.href} className="coast-home-inline-link">
                    Read guide
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="coast-home-editorial-column">
            {model.coastalPulse.events.map((event) => (
              <article key={event.href} className="coast-home-story-card coast-home-story-card-compact">
                <div className="coast-home-story-body">
                  <p className="coast-home-story-tag">{event.eyebrow}</p>
                  <h3>{event.title}</h3>
                  <p>{event.summary}</p>
                  <Link href={event.href} className="coast-home-inline-link">
                    View event
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export const HomepageListings = ({ model, resolveMediaUrl }: SharedProps) => {
  return (
    <section className="section">
      <div className="container">
        <div className="coast-home-section-head coast-home-section-head-stack">
          <div>
            <p className="coast-home-eyebrow coast-home-eyebrow-dark">Coastal Finds</p>
            <h2 className="coast-home-section-title">Practical directory picks for launch.</h2>
          </div>
        </div>
        <div className="coast-home-listing-grid">
          {model.editorsChoice.map((listing, index) => (
            <article
              key={listing.href}
              className={index === 0 ? 'coast-home-listing-card coast-home-listing-card-featured' : 'coast-home-listing-card'}
            >
              <div className="coast-home-listing-media">
                <HomeMedia
                  media={listing.image}
                  src={resolveMediaUrl(listing.image?.url)}
                  altFallback={listing.name}
                  className="coast-home-card-image"
                  sizes={index === 0 ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 900px) 100vw, 25vw'}
                />
              </div>
              <div className="coast-home-listing-body">
                <p className="coast-home-story-tag">
                  {listing.city} · {listing.category}
                </p>
                <h3>{listing.name}</h3>
                <p>{listing.summary}</p>
                <Link href={listing.href} className="coast-home-inline-link">
                  Open listing
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export const HomepagePlanningBanner = ({ model }: SharedProps) => {
  return (
    <section className="section">
      <div className="container">
        <div className="coast-home-signup">
          <div className="coast-home-signup-copy">
            <h2>{model.planningBanner.title}</h2>
            <p>{model.planningBanner.body}</p>
          </div>
          <form className="coast-home-signup-form" action="#" method="post">
            <label htmlFor="coast-home-email" className="sr-only">
              Email address
            </label>
            <input id="coast-home-email" name="email" type="email" required placeholder="Email Address" />
            <Link href={model.planningBanner.button.href} className="button-primary">
              {model.planningBanner.button.label}
            </Link>
          </form>
        </div>
      </div>
    </section>
  )
}
