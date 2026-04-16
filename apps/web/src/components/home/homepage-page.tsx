import type { HomepageViewModel } from './homepage-view-model'
import { HomepageHero } from './homepage-hero'
import {
  HomepageCategoryShortcuts,
  HomepageDestinations,
  HomepageEditorial,
  HomepagePlanningBanner,
  HomepageTripFinder,
  HomepageUtilitySnapshot
} from './homepage-sections'

type HomepagePageProps = {
  model: HomepageViewModel
  resolveMediaUrl: (pathOrUrl: string | null | undefined) => string | null
}

export const HomepagePage = ({ model, resolveMediaUrl }: HomepagePageProps) => {
  const heroImageUrl = resolveMediaUrl(model.hero.image?.url)

  return (
    <>
      <HomepageHero hero={model.hero} heroImageUrl={heroImageUrl} />
      <HomepageDestinations destinationStrip={model.destinationStrip} resolveMediaUrl={resolveMediaUrl} />
      <HomepageCategoryShortcuts categoryHighlights={model.categoryHighlights} />
      <HomepageTripFinder tripFinder={model.tripFinder} backgroundImageUrl={heroImageUrl} />
      <HomepageUtilitySnapshot utilitySnapshot={model.utilitySnapshot} />
      <HomepageEditorial
        coastalPulse={model.coastalPulse}
        editorsChoice={model.editorsChoice}
        resolveMediaUrl={resolveMediaUrl}
      />
      <HomepagePlanningBanner planningBanner={model.planningBanner} />
    </>
  )
}
