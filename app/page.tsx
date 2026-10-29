import { Metadata } from 'next'
import Blocks from '@/components/Blocks'
import { getPage, resolveBlocks } from 'lib/pages'

export function generateMetadata(): Metadata {
  const page = getPage('index')
  return {
    title: { absolute: page.title },
    ...(page.description && { description: page.description }),
  }
}

export default function Home() {
  return <Blocks blocks={resolveBlocks(getPage('index').content_blocks)} />
}
