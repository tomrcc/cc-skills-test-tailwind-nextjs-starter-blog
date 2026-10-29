import { allBlogs, allPages, type Blog, type Page } from 'contentlayer/generated'
import { allCoreContent, sortPosts, type CoreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import type { Block, ResolvedBlock } from '@/components/Blocks'
import { findAuthor } from './authors'

export function getPage(slug: string): Page {
  const page = allPages.find((p) => p.slug === slug)
  if (!page) throw new Error(`Missing data/pages/${slug}.md`)
  return page
}

export function pageMetadata(page: Page) {
  return genPageMetadata({ title: page.title, description: page.description || undefined })
}

export type LatestPost = Pick<
  CoreContent<Blog>,
  'slug' | 'date' | 'title' | 'summary' | 'tags' | 'filePath'
>

// Block components render from props only, so collection reads happen here.
export function resolveBlocks(blocks: Block[] | null | undefined): ResolvedBlock[] {
  return (blocks ?? []).map((block) => {
    if (block._type === 'latest_posts') {
      const posts: LatestPost[] = allCoreContent(sortPosts(allBlogs)).map(
        ({ slug, date, title, summary, tags, filePath }) => ({
          slug,
          date,
          title,
          summary,
          tags,
          filePath,
        })
      )
      return { block, literals: { posts } }
    }
    if (block._type === 'author_profile' && !findAuthor(block.author)) {
      throw new Error(`No author "${block.author}" in data/authors`)
    }
    return { block }
  })
}
