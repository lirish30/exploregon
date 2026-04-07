import type { HomepageViewModel } from './homepage-view-model'
import { HomepageHero } from './homepage-hero'
import {
  HomepageCategoryShortcuts,
  HomepageDestinations,
  HomepageEditorial,
  HomepageListings,
  HomepagePlanningBanner,
  HomepageTripFinder,
  HomepageUtilitySnapshot
} from './homepage-sections'

type HomepagePageProps = {
  model: HomepageViewModel
  resolveMediaUrl: (pathOrUrl: string | null | undefined) => string | null
}

export const HomepagePage = ({ model, resolveMediaUrl }: HomepagePageProps) => {
  return (
    <>
      <HomepageHero hero={model.hero} heroImageUrl={resolveMediaUrl(model.hero.image?.url)} />
      <HomepageCategoryShortcuts categoryHighlights={model.categoryHighlights} />
      <HomepageDestinations destinationStrip={model.destinationStrip} resolveMediaUrl={resolveMediaUrl} />
      <HomepageTripFinder tripFinder={model.tripFinder} />
      <HomepageUtilitySnapshot utilitySnapshot={model.utilitySnapshot} />
      <HomepageEditorial coastalPulse={model.coastalPulse} resolveMediaUrl={resolveMediaUrl} />
      <HomepageListings editorsChoice={model.editorsChoice} resolveMediaUrl={resolveMediaUrl} />
      <HomepagePlanningBanner planningBanner={model.planningBanner} />
    </>
  )
}
