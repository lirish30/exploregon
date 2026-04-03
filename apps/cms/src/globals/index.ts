import type { GlobalConfig } from 'payload'

import { Footer } from './Footer.ts'
import { Homepage } from './Homepage.ts'
import { Navigation } from './Navigation.ts'
import { SiteSettings } from './SiteSettings.ts'

export const globals: GlobalConfig[] = [SiteSettings, Homepage, Navigation, Footer]
