import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { collections } from './collections'
import { Users } from './collections/Users'
import { globals } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL
const payloadPort = process.env.PAYLOAD_PORT || '3001'
const defaultServerURL = `http://localhost:${payloadPort}`

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  secret: process.env.PAYLOAD_SECRET || 'REPLACE_WITH_LONG_RANDOM_SECRET',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || defaultServerURL,
  db: connectionString
    ? postgresAdapter({
        pool: {
          connectionString
        }
      })
    : sqliteAdapter({
        client: {
          url: 'file:./payload.db'
        },
        transactionOptions: {}
      }),
  collections,
  globals,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  }
})
