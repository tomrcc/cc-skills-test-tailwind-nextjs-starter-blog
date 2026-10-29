import NewsletterForm from 'pliny/ui/NewsletterForm'
import siteMetadata from '@/data/siteMetadata'

export default function Newsletter({ title }: { title?: string | null }) {
  if (!siteMetadata.newsletter?.provider) return null
  return (
    <div className="flex items-center justify-center pt-4">
      <NewsletterForm title={title || undefined} />
    </div>
  )
}
