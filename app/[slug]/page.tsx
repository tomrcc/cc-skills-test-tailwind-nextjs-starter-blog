import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import Blocks from '@/components/Blocks'
import PageTitle from '@/components/PageTitle'
import { getPage, pageMetadata, resolveBlocks } from 'lib/pages'

export function generateStaticParams() {
  return allPages.filter((p) => p.slug !== 'index').map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  return pageMetadata(getPage(slug))
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const page = getPage(slug)
  if (page._schema === 'page_builder') {
    return <Blocks blocks={resolveBlocks(page.content_blocks)} />
  }
  return (
    <article className="pt-6">
      {page.title && (
        <PageTitle data-editable="text" data-prop="title">
          {page.title}
        </PageTitle>
      )}
      <div
        className="prose dark:prose-invert max-w-none pt-8 pb-8"
        data-editable="text"
        data-type="block"
        data-prop="@content"
      >
        <MDXLayoutRenderer code={page.body.code} components={components} />
      </div>
    </article>
  )
}
