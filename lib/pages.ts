import { allPages, type Page } from 'contentlayer/generated'

export function getPage(slug: string): Page {
  const page = allPages.find((p) => p.slug === slug)
  if (!page) throw new Error(`Missing data/pages/${slug}.md`)
  return page
}

// Pages rendered by app/[slug]; index, listing and about pages have their own routes.
export function getSlugPages(): Page[] {
  return allPages.filter((p) => p.slug !== 'index' && (!p._schema || p._schema === 'page_builder'))
}
