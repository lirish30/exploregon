import Link from 'next/link'
import type { CSSProperties } from 'react'

import type { HomepageViewModel } from './homepage-view-model'
import { PhosphorIcon } from './phosphor-icon'
import { HomeDestinationCarousel } from './home-destination-carousel'
import { HomeTabbedFeatureGrid, type HomeTabbedFeatureStory, type HomeTabbedFeatureTab } from './home-tabbed-feature-grid'

type ResolveMediaUrl = (pathOrUrl: string | null | undefined) => string | null

type HomepageCategoryShortcutsProps = {
  categoryHighlights: HomepageViewModel['categoryHighlights']
}

export const HomepageCategoryShortcuts = ({ categoryHighlights }: HomepageCategoryShortcutsProps) => {
  const categoryNotes = categoryHighlights.slice(0, 3)

  return (
    <section className="section coast-home-shortcuts">
      <div className="container">
        <div className="coast-home-shortcut-layout">
          <div className="coast-home-shortcut-intro">
            <h2 className="coast-home-section-title">Build your coast plan with the right starting point.</h2>
            <p className="coast-home-section-copy">
              Start with a category and quickly narrow toward places, stays, and activities that fit your trip style.
            </p>
            <ul className="coast-home-shortcut-points">
              {categoryNotes.map((category) => (
                <li key={`category-note-${category.href}`}>{category.name}</li>
              ))}
            </ul>
          </div>
          <div className="coast-home-shortcut-grid">
            {categoryHighlights.map((category) => (
              <Link key={category.href} href={category.href} className="coast-home-shortcut-card coast-home-shortcut-card-large">
                {category.icon && (
                  <span className="coast-home-shortcut-icon">
                    <PhosphorIcon name={category.icon} size={30} />
                  </span>
                )}
                <div className="coast-home-shortcut-content">
                  <h3 className="coast-home-shortcut-name">{category.name}</h3>
                  <span className="coast-home-shortcut-copy">{category.description}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

type HomepageDestinationsProps = {
  destinationStrip: HomepageViewModel['destinationStrip']
  resolveMediaUrl: ResolveMediaUrl
}

export const HomepageDestinations = ({ destinationStrip, resolveMediaUrl }: HomepageDestinationsProps) => {
  const destinationCards = destinationStrip.map((city) => ({
    ...city,
    imageUrl: resolveMediaUrl(city.image?.url)
  }))

  return (
    <section className="section coast-home-panel">
      <div className="container">
        <div className="coast-home-section-head">
          <div>
            <h2 className="coast-home-section-title">Every town has a different rhythm.</h2>
            <p className="coast-home-section-copy">
              Compare launch cities by vibe, access, and what kind of coast weekend they support best.
            </p>
          </div>
          <Link href="/cities" className="coast-home-section-link">
            View all towns
          </Link>
        </div>
        <HomeDestinationCarousel cards={destinationCards} />
      </div>
    </section>
  )
}

type HomepageTripFinderProps = {
  tripFinder: HomepageViewModel['tripFinder']
  backgroundImageUrl: string | null
}

export const HomepageTripFinder = ({ tripFinder, backgroundImageUrl }: HomepageTripFinderProps) => {
  const sectionStyle = (
    backgroundImageUrl
      ? ({ '--coast-trip-finder-bg-image': `url("${backgroundImageUrl}")` } as CSSProperties)
      : undefined
  )

  return (
    <section className="section coast-home-trip-finder-wrap" style={sectionStyle}>
      <div className="container">
        <div className="coast-home-trip-finder">
          <div className="coast-home-trip-copy">
            <h2 className="coast-home-section-title">{tripFinder.title}</h2>
            <p className="coast-home-section-copy">{tripFinder.intro}</p>
            <form action={tripFinder.resultsBaseUrl} method="get" className="coast-home-filter-panel">
              {tripFinder.filters.map((group) => (
                <div key={group.label} className="coast-home-filter-group">
                  <select name={group.name} defaultValue="" aria-label={group.label}>
                    <option value="">{group.label}</option>
                    {group.options.map((option) => (
                      <option key={`${group.label}-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button type="submit" className="button-primary coast-home-filter-submit">
                {tripFinder.resultsButtonLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

type HomepageUtilitySnapshotProps = {
  utilitySnapshot: HomepageViewModel['utilitySnapshot']
}

export const HomepageUtilitySnapshot = ({ utilitySnapshot }: HomepageUtilitySnapshotProps) => {
  return (
    <section className="section coast-home-utility-wrap">
      <div className="container coast-home-utility-grid">
        <div className="coast-home-utility-copy">
          <h2 className="coast-home-section-title">{utilitySnapshot.title}</h2>
          <p className="coast-home-section-copy">{utilitySnapshot.intro}</p>
          <div className="coast-home-trip-actions">
            <Link href={utilitySnapshot.primaryLink.href} className="button-primary">
              {utilitySnapshot.primaryLink.label}
            </Link>
            <Link href={utilitySnapshot.secondaryLink.href} className="coast-home-outline-link coast-home-outline-link-dark">
              {utilitySnapshot.secondaryLink.label}
            </Link>
          </div>
        </div>
        <aside className="coast-home-utility-panel">
          {utilitySnapshot.metrics.map((metric) => (
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

type HomepageEditorialProps = {
  coastalPulse: HomepageViewModel['coastalPulse']
  editorsChoice: HomepageViewModel['editorsChoice']
  resolveMediaUrl: ResolveMediaUrl
}

export const HomepageEditorial = ({ coastalPulse, editorsChoice, resolveMediaUrl }: HomepageEditorialProps) => {
  const listingStories: HomeTabbedFeatureStory[] = editorsChoice.map((listing) => ({
    id: listing.href,
    title: listing.name,
    summary: listing.summary,
    href: listing.href,
    eyebrow: `${listing.city} · ${listing.category}`,
    ctaLabel: 'Open listing',
    image: listing.image,
    imageUrl: resolveMediaUrl(listing.image?.url)
  }))

  const editorialTabs: HomeTabbedFeatureTab[] = [
    {
      id: 'guides',
      label: 'Guides',
      stories: coastalPulse.guides.map((guide): HomeTabbedFeatureStory => ({
        id: guide.href,
        title: guide.title,
        summary: guide.summary,
        href: guide.href,
        eyebrow: guide.eyebrow,
        ctaLabel: 'Read guide',
        image: guide.image,
        imageUrl: resolveMediaUrl(guide.image?.url)
      }))
    },
    {
      id: 'listings',
      label: 'Listings',
      stories: listingStories
    }
  ].filter((tab) => tab.stories.length > 0)

  if (editorialTabs.length === 0) {
    return null
  }

  return (
    <HomeTabbedFeatureGrid
      title="Coastal Pulse"
      intro={coastalPulse.intro}
      tabs={editorialTabs}
      sectionClassName="coast-home-editorial"
    />
  )
}

type HomepagePlanningBannerProps = {
  planningBanner: HomepageViewModel['planningBanner']
}

export const HomepagePlanningBanner = ({ planningBanner }: HomepagePlanningBannerProps) => {
  return (
    <section className="section">
      <div className="container">
        <div className="coast-home-signup" id="newsletter">
          <div className="coast-home-signup-copy">
            <h2>{planningBanner.title}</h2>
            <p>{planningBanner.body}</p>
          </div>
          <form className="coast-home-signup-form" action="#" method="post">
            <label htmlFor="coast-home-email" className="sr-only">
              Email address
            </label>
            <input id="coast-home-email" name="email" type="email" required placeholder="Your email address" />
            <Link href={planningBanner.button.href} className="button-secondary coast-home-signup-submit">
              {planningBanner.button.label}
            </Link>
          </form>
        </div>
      </div>
    </section>
  )
}
