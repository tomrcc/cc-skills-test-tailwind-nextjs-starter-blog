import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import Blocks from '@/components/Blocks'
import PageTitle from '@/components/PageTitle'
import { genPageMetadata } from 'app/seo'
import { getPage, getSlugPages } from 'lib/pages'

export function generateStaticParams() {
  return getSlugPages().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const { title, description } = getPage(slug)
  return genPageMetadata({ title, description })
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const page = getPage(slug)
  if (page.content_blocks) return <Blocks blocks={page.content_blocks} />
  return (
    <>
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <PageTitle editableProp="title">{page.title}</PageTitle>
      </div>
      <div
        className="prose dark:prose-invert max-w-none pb-8"
        data-editable="text"
        data-type="block"
        data-prop="@content"
      >
        <MDXLayoutRenderer code={page.body.code} components={components} />
      </div>
    </>
  )
}
