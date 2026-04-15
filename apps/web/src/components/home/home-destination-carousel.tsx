'use client'

import { useEffect, useMemo, useState } from 'react'

import type { HomepageViewModel } from './homepage-view-model'
import { CityDestinationCard } from '../primitives/city-destination-card'

type DestinationCarouselCard = HomepageViewModel['destinationStrip'][number] & {
  imageUrl: string | null
}

type HomeDestinationCarouselProps = {
  cards: DestinationCarouselCard[]
}

const CARDS_PER_PAGE = 4

const chunkCards = (cards: DestinationCarouselCard[]): DestinationCarouselCard[][] => {
  const slides: DestinationCarouselCard[][] = []
  for (let index = 0; index < cards.length; index += CARDS_PER_PAGE) {
    slides.push(cards.slice(index, index + CARDS_PER_PAGE))
  }
  return slides
}

export const HomeDestinationCarousel = ({ cards }: HomeDestinationCarouselProps) => {
  const slides = useMemo(() => chunkCards(cards), [cards])
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6000)

    return () => window.clearInterval(interval)
  }, [slides.length])

  useEffect(() => {
    if (!slides.length) {
      setActiveSlide(0)
      return
    }

    if (activeSlide > slides.length - 1) {
      setActiveSlide(slides.length - 1)
    }
  }, [activeSlide, slides.length])

  if (!slides.length) {
    return <div className="coast-home-destination-grid" />
  }

  if (slides.length === 1) {
    return (
      <div className="coast-home-destination-grid">
        {slides[0].map((city) => (
          <CityDestinationCard
            key={city.href}
            name={city.name}
            summary={city.summary}
            image={city.image}
            imageUrl={city.imageUrl}
            href={city.href}
            badges={city.badges}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="coast-home-destination-carousel">
      <div className="coast-home-destination-viewport">
        <div className="coast-home-destination-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
          {slides.map((slide, slideIndex) => (
            <div key={`slide-${slideIndex}`} className="coast-home-destination-slide">
              <div className="coast-home-destination-grid">
                {slide.map((city) => (
                  <CityDestinationCard
                    key={city.href}
                    name={city.name}
                    summary={city.summary}
                    image={city.image}
                    imageUrl={city.imageUrl}
                    href={city.href}
                    badges={city.badges}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="coast-home-destination-pager" aria-label="City card pages">
        {slides.map((_, index) => (
          <button
            key={`pager-${index}`}
            type="button"
            className={`coast-home-destination-dot${index === activeSlide ? ' is-active' : ''}`}
            onClick={() => setActiveSlide(index)}
            aria-label={`Show city page ${index + 1}`}
            aria-current={index === activeSlide ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
