import type { GlobalConfig } from 'payload'

import { Footer } from './Footer'
import { Header } from './Header'
import { Homepage } from './Homepage'
import { Navigation } from './Navigation'
import { SiteSettings } from './SiteSettings'

export const globals: GlobalConfig[] = [SiteSettings, Homepage, Navigation, Header, Footer]
