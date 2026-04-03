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
      <HomepageCategoryShortcuts model={model} resolveMediaUrl={resolveMediaUrl} />
      <HomepageDestinations model={model} resolveMediaUrl={resolveMediaUrl} />
      <HomepageTripFinder model={model} resolveMediaUrl={resolveMediaUrl} />
      <HomepageUtilitySnapshot model={model} resolveMediaUrl={resolveMediaUrl} />
      <HomepageEditorial model={model} resolveMediaUrl={resolveMediaUrl} />
      <HomepageListings model={model} resolveMediaUrl={resolveMediaUrl} />
      <HomepagePlanningBanner model={model} resolveMediaUrl={resolveMediaUrl} />
    </>
  )
}
