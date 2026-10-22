import type { ComponentType } from 'react'
import PageHeader from '@/components/blocks/PageHeader'
import RecentPosts from '@/components/blocks/RecentPosts'
import ProjectGrid from '@/components/blocks/ProjectGrid'
import AboutAuthor from '@/components/AboutAuthor'
import PostAuthors from '@/components/PostAuthors'
import SocialLink from '@/components/SocialLink'

// Keys are the `_type` values in content_blocks.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockMap: Record<string, ComponentType<any>> = {
  page_header: PageHeader,
  recent_posts: RecentPosts,
  project_grid: ProjectGrid,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentMap: Record<string, ComponentType<any>> = {
  ...blockMap,
  'about-author': AboutAuthor,
  'post-authors': PostAuthors,
  'social-link': SocialLink,
}
