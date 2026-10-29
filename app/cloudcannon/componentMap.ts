import type { ComponentType } from 'react'
import PageHeader from '@/components/blocks/PageHeader'
import LatestPosts from '@/components/blocks/LatestPosts'
import ProjectGrid from '@/components/blocks/ProjectGrid'
import Newsletter from '@/components/blocks/Newsletter'
import AuthorProfile from '@/components/blocks/AuthorProfile'
import { FooterContent } from '@/components/Footer'
import PostAuthors from '@/components/PostAuthors'
import PostTags from '@/components/PostTags'

// Keys are the `_type` values in content_blocks.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockMap: Record<string, ComponentType<any>> = {
  page_header: PageHeader,
  latest_posts: LatestPosts,
  project_grid: ProjectGrid,
  newsletter: Newsletter,
  author_profile: AuthorProfile,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentMap: Record<string, ComponentType<any>> = {
  ...blockMap,
  footer: FooterContent,
  post_authors: PostAuthors,
  post_tags: PostTags,
}
