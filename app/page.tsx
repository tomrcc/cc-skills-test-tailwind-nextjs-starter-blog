import { Metadata } from 'next'
import Blocks from '@/components/Blocks'
import { getPage } from 'lib/pages'

export function generateMetadata(): Metadata {
  const { title, description } = getPage('index')
  return {
    ...(title && { title: { absolute: title } }),
    ...(description && { description }),
  }
}

export default function Page() {
  const page = getPage('index')
  return <Blocks blocks={page.content_blocks} />
}
