import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { collections } from './collections'
import { Users } from './collections/Users'
import { defaultLexical } from './fields/defaultLexical'
import { globals } from './globals'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL
const payloadPort = process.env.PAYLOAD_PORT || '3001'
const defaultServerURL = `http://localhost:${payloadPort}`
const enableDevSchemaPush = process.env.PAYLOAD_PUSH_SCHEMA === 'true'
const isProduction = process.env.NODE_ENV === 'production'
const configuredServerURL = process.env.PAYLOAD_PUBLIC_SERVER_URL
const sqliteDbPath = process.env.SQLITE_DB_FILE || './payload.db'
const sqliteDbURL = sqliteDbPath.startsWith('file:') ? sqliteDbPath : `file:${sqliteDbPath}`

export default buildConfig({
  admin: {
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900
        }
      ]
    },
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  secret: process.env.PAYLOAD_SECRET || 'REPLACE_WITH_LONG_RANDOM_SECRET',
  editor: defaultLexical,
  // In development, always bind Payload's serverURL to the active PAYLOAD_PORT to avoid
  // cross-port auth/session issues when stale env vars point at a different local port.
  serverURL: isProduction && configuredServerURL ? configuredServerURL : defaultServerURL,
  db: connectionString
    ? postgresAdapter({
        pool: {
          connectionString
        },
        // Avoid interactive drizzle rename prompts during dev requests (e.g. /admin login).
        // Opt in when needed: PAYLOAD_PUSH_SCHEMA=true
        push: enableDevSchemaPush
      })
    : sqliteAdapter({
        client: {
          url: sqliteDbURL
        },
        // Avoid interactive drizzle rename prompts during dev requests (e.g. /admin login).
        // Opt in when needed: PAYLOAD_PUSH_SCHEMA=true
        push: enableDevSchemaPush,
        transactionOptions: {}
      }),
  collections,
  globals,
  plugins,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  }
})
