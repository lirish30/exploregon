import Link from 'next/link'

import type { HomepageViewModel } from './homepage-view-model'
import { HomeMedia } from './home-media'

type HomepageHeroProps = {
  hero: HomepageViewModel['hero']
  heroImageUrl: string | null
}

export const HomepageHero = ({ hero, heroImageUrl }: HomepageHeroProps) => {
  return (
    <section className="coast-home-hero">
      <div className="coast-home-hero-visual">
        <HomeMedia
          media={hero.image}
          src={heroImageUrl}
          altFallback="Dramatic Oregon Coast shoreline"
          className="coast-home-hero-image"
          sizes="100vw"
          priority
        />
        <div className="coast-home-hero-overlay" />
        <div className="coast-home-hero-mist" />
      </div>
      <div className="container coast-home-hero-inner">
        <div className="coast-home-hero-copy">
          <p className="coast-home-eyebrow">{hero.eyebrow}</p>
          <h1 className="coast-home-hero-title">{hero.title}</h1>
          <p className="coast-home-hero-summary">{hero.summary}</p>
          <form className="coast-home-search" action="/listings" method="get">
            <label htmlFor="coast-home-search" className="sr-only">
              Search the Oregon Coast directory
            </label>
            <input
              id="coast-home-search"
              name="q"
              className="coast-home-search-input"
              placeholder="Search by town, activity, lodging..."
            />
            <button type="submit" className="button-primary coast-home-search-button">
              Search Directory
            </button>
          </form>
          <div className="coast-home-chip-row">
            {hero.quickLinks.map((link) => (
              <Link key={`${link.label}-${link.href}`} href={link.href} className="coast-home-chip">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="coast-home-hero-actions">
            <Link href={hero.primaryCta.href} className="button-primary">
              {hero.primaryCta.label}
            </Link>
            <Link href={hero.secondaryCta.href} className="coast-home-outline-link">
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
