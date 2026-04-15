'use client'

import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'

import type { HomepageViewModel } from './homepage-view-model'
import { HomeMedia } from './home-media'

type HomepageHeroProps = {
  hero: HomepageViewModel['hero']
  heroImageUrl: string | null
}

export const HomepageHero = ({ hero, heroImageUrl }: HomepageHeroProps) => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const quickLinkCount = hero.quickLinks.length

  useEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      return
    }

    let rafId = 0

    const updateParallax = () => {
      rafId = 0

      const rect = section.getBoundingClientRect()
      const start = window.innerHeight * 0.8
      const end = -rect.height * 0.6
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)))
      const offsetY = progress * 68
      const scale = 1.03 + progress * 0.14

      section.style.setProperty('--hero-parallax-y', `${offsetY.toFixed(2)}px`)
      section.style.setProperty('--hero-parallax-scale', scale.toFixed(4))
    }

    const onScrollOrResize = () => {
      if (rafId !== 0) {
        return
      }
      rafId = window.requestAnimationFrame(updateParallax)
    }

    updateParallax()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const marqueeQuickLinks = useMemo(() => {
    if (hero.quickLinks.length < 2) {
      return hero.quickLinks
    }

    return [...hero.quickLinks, ...hero.quickLinks]
  }, [hero.quickLinks])

  return (
    <section ref={sectionRef} className="coast-home-hero">
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
          <h1 className="coast-home-hero-title">{hero.title}</h1>
          <p className="coast-home-hero-summary">{hero.summary}</p>
          <div className="coast-home-hero-actions">
            <Link href={hero.primaryCta.href} className="button-primary">
              {hero.primaryCta.label}
            </Link>
            <Link href={hero.secondaryCta.href} className="coast-home-outline-link">
              {hero.secondaryCta.label}
            </Link>
          </div>
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
        </div>
      </div>
      <div className="coast-home-chip-row-carousel" aria-label="Listing categories">
        <div className="coast-home-chip-track" aria-live="off">
          {marqueeQuickLinks.map((link, index) => (
            <Link
              key={`${link.label}-${link.href}-${index}`}
              href={link.href}
              className="coast-home-chip"
              aria-hidden={quickLinkCount > 1 && index >= quickLinkCount ? true : undefined}
              tabIndex={quickLinkCount > 1 && index >= quickLinkCount ? -1 : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
