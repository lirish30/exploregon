'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { NormalizedMedia } from '../../lib/types'
import { HomeMedia } from './home-media'

export type HomeTabbedFeatureStory = {
  id: string
  title: string
  summary: string
  href: string
  eyebrow: string
  ctaLabel: string
  image: NormalizedMedia | null
  imageUrl: string | null
}

export type HomeTabbedFeatureTab = {
  id: string
  label: string
  stories: HomeTabbedFeatureStory[]
}

type HomeTabbedFeatureGridProps = {
  title: string
  intro?: string
  tabs: HomeTabbedFeatureTab[]
  sectionClassName?: string
}

export const HomeTabbedFeatureGrid = ({
  title,
  intro,
  tabs,
  sectionClassName
}: HomeTabbedFeatureGridProps) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '')

  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0], [activeTabId, tabs])
  const featuredStory = activeTab?.stories[0]
  const stackedStories = activeTab?.stories.slice(1, 4) ?? []

  if (!featuredStory || tabs.length === 0) {
    return null
  }

  return (
    <section className={`section ${sectionClassName ?? ''}`.trim()}>
      <div className="container">
        <div className="coast-home-tabbed-head">
          <div className="coast-home-tabbed-head-copy">
            <h2 className="coast-home-section-title">{title}</h2>
            {intro ? <p className="coast-home-section-copy">{intro}</p> : null}
          </div>
          <div className="coast-home-tabbed-controls" role="tablist" aria-label={`${title} tabs`}>
            {tabs.map((tab) => {
              const selected = tab.id === activeTab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`coast-home-tabbed-control ${selected ? 'is-active' : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="coast-home-tabbed-grid">
          <article className="coast-home-tabbed-feature">
            <div className="coast-home-tabbed-feature-media">
              <HomeMedia
                media={featuredStory.image}
                src={featuredStory.imageUrl}
                altFallback={featuredStory.title}
                className="coast-home-card-image"
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </div>
            <div className="coast-home-tabbed-feature-body">
              <p className="coast-home-story-tag">{featuredStory.eyebrow}</p>
              <h3>{featuredStory.title}</h3>
              <p>{featuredStory.summary}</p>
              <Link href={featuredStory.href} className="coast-home-section-link">
                {featuredStory.ctaLabel}
              </Link>
            </div>
          </article>

          <div className="coast-home-tabbed-stack">
            {stackedStories.map((story) => (
              <article key={story.id} className="coast-home-tabbed-stack-card">
                <div className="coast-home-tabbed-stack-media">
                  <HomeMedia
                    media={story.image}
                    src={story.imageUrl}
                    altFallback={story.title}
                    className="coast-home-card-image"
                    sizes="(max-width: 900px) 9rem, 11rem"
                  />
                </div>
                <div className="coast-home-tabbed-stack-body">
                  <h3>{story.title}</h3>
                  <p>{story.summary}</p>
                  <Link href={story.href} className="coast-home-section-link">
                    {story.ctaLabel}
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
