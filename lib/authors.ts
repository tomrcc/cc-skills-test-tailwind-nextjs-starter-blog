import type { Authors } from 'contentlayer/generated'
// Registered components import this in the browser. Reading the Authors JSON alone
// keeps blog bodies out of the editor bundle.
import authorsJson from '../.contentlayer/generated/Authors/_index.json'

const allAuthors = authorsJson as unknown as Authors[]

export function findAuthor(slug: string | null | undefined): Authors | undefined {
  return allAuthors.find((author) => author.slug === slug)
}
