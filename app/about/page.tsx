import AboutAuthor from '@/components/AboutAuthor'
import AuthorLayout from '@/layouts/AuthorLayout'
import { genPageMetadata } from 'app/seo'
import { getPage } from 'lib/pages'

export function generateMetadata() {
  return genPageMetadata({ title: getPage('about').title })
}

export default function Page() {
  const page = getPage('about')

  return (
    <AuthorLayout title={page.title}>
      <div data-editable="component" data-component="about-author" data-prop-author="author">
        <AboutAuthor author={page.author || ''} />
      </div>
    </AuthorLayout>
  )
}
