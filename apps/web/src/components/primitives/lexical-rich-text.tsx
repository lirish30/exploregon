import Link from 'next/link'
import type { ReactNode } from 'react'

import { toPayloadMediaUrl } from '../../lib/schema'
import type { LexicalRichText } from '../../lib/types'

type UnknownNode = {
  type?: unknown
  children?: unknown
  [k: string]: unknown
}

const isNodeArray = (value: unknown): value is UnknownNode[] => Array.isArray(value)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const asString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback)

const toHref = (fields: unknown): string | null => {
  if (!isRecord(fields)) {
    return null
  }

  const linkType = fields.linkType
  if (linkType === 'custom') {
    const url = asString(fields.url).trim()
    return url || null
  }

  const doc = fields.doc
  if (!isRecord(doc) || !isRecord(doc.value)) {
    return null
  }

  const relationTo = asString(doc.relationTo)
  const slug = asString(doc.value.slug)
  if (!slug) {
    return null
  }

  const relationToPath: Record<string, string> = {
    cities: `/cities/${slug}`,
    listingCategories: `/categories/${slug}`,
    listings: `/listings/${slug}`,
    guides: `/guides/${slug}`,
    events: `/events/${slug}`,
    itineraries: `/itineraries/${slug}`,
    regions: `/regions/${slug}`,
    pages: `/${slug}`
  }

  return relationToPath[relationTo] ?? null
}

const applyTextFormatting = (text: string, format: number): ReactNode => {
  let node: ReactNode = text

  if (format & 16) {
    node = <code>{node}</code>
  }
  if (format & 8) {
    node = <u>{node}</u>
  }
  if (format & 4) {
    node = <s>{node}</s>
  }
  if (format & 2) {
    node = <em>{node}</em>
  }
  if (format & 1) {
    node = <strong>{node}</strong>
  }
  if (format & 32) {
    node = <sub>{node}</sub>
  }
  if (format & 64) {
    node = <sup>{node}</sup>
  }

  return node
}

const renderNodes = (nodes: UnknownNode[] | undefined): ReactNode[] => {
  if (!nodes?.length) {
    return []
  }

  return nodes.map((node, index) => renderNode(node, index)).filter((node): node is ReactNode => node !== null)
}

const renderUpload = (node: UnknownNode, key: number): ReactNode => {
  const value = node.value
  const uploadDoc = isRecord(value) ? value : null
  const imageUrl = toPayloadMediaUrl(asString(uploadDoc?.url, '').trim())
  const alt = asString(uploadDoc?.alt, '').trim()

  if (!imageUrl) {
    return null
  }

  return (
    <figure key={key} className="cms-richtext-upload">
      <img src={imageUrl} alt={alt || 'Uploaded image'} />
    </figure>
  )
}

const renderNode = (node: UnknownNode, key: number): ReactNode => {
  const type = asString(node.type)
  const children = isNodeArray(node.children) ? node.children : []
  const renderedChildren = renderNodes(children)

  switch (type) {
    case 'paragraph':
      return <p key={key}>{renderedChildren}</p>
    case 'heading': {
      const tag = asString(node.tag, 'h2')

      if (tag === 'h1') {
        return <h1 key={key}>{renderedChildren}</h1>
      }
      if (tag === 'h2') {
        return <h2 key={key}>{renderedChildren}</h2>
      }
      if (tag === 'h3') {
        return <h3 key={key}>{renderedChildren}</h3>
      }
      if (tag === 'h4') {
        return <h4 key={key}>{renderedChildren}</h4>
      }

      return <h5 key={key}>{renderedChildren}</h5>
    }
    case 'list': {
      const listType = asString(node.listType)
      if (listType === 'number') {
        return <ol key={key}>{renderedChildren}</ol>
      }
      return <ul key={key}>{renderedChildren}</ul>
    }
    case 'listitem':
      return <li key={key}>{renderedChildren}</li>
    case 'quote':
      return <blockquote key={key}>{renderedChildren}</blockquote>
    case 'linebreak':
      return <br key={key} />
    case 'horizontalrule':
      return <hr key={key} />
    case 'link': {
      const href = toHref(node.fields)
      const newTab = isRecord(node.fields) && node.fields.newTab === true
      if (!href) {
        return <span key={key}>{renderedChildren}</span>
      }

      if (href.startsWith('/')) {
        return (
          <Link key={key} href={href}>
            {renderedChildren}
          </Link>
        )
      }

      return (
        <a
          key={key}
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noreferrer noopener' : undefined}
        >
          {renderedChildren}
        </a>
      )
    }
    case 'upload':
      return renderUpload(node, key)
    case 'text': {
      const text = asString(node.text)
      if (!text) {
        return null
      }

      const format = typeof node.format === 'number' ? node.format : 0
      return <span key={key}>{applyTextFormatting(text, format)}</span>
    }
    default:
      return renderedChildren.length ? <span key={key}>{renderedChildren}</span> : null
  }
}

type LexicalRichTextProps = {
  value: LexicalRichText | null
}

export function LexicalRichTextRenderer({ value }: LexicalRichTextProps) {
  const rootChildren = isNodeArray(value?.root?.children) ? value.root.children : []

  if (!rootChildren.length) {
    return null
  }

  return <div className="cms-richtext">{renderNodes(rootChildren)}</div>
}
