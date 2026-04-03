import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'

import { collections } from './collections/index.ts'
import { globals } from './globals/index.ts'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'REPLACE_WITH_LONG_RANDOM_SECRET',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || ''
    }
  }),
  collections,
  globals,
  typescript: {
    outputFile: 'src/payload-types.ts'
  }
})
