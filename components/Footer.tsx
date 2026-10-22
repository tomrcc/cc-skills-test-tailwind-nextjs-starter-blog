import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon, { type SocialKind } from '@/components/social-icons'
import SocialLink from './SocialLink'
import socialLinks from '@/data/social.json'
import site from '@/data/site.json'

const social = socialLinks as { kind: SocialKind; href: string }[]

export default function Footer() {
  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-3 flex gap-x-4">
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
          <div
            className="contents"
            data-editable="array"
            data-prop="@data[social]"
            data-component="social-link"
            data-direction="row"
          >
            {social.map((link, index) => (
              <span key={index} className="flex" data-editable="array-item">
                <SocialLink kind={link.kind} href={link.href} />
              </span>
            ))}
          </div>
        </div>
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div data-editable="text" data-prop="@data[site].author">
            {siteMetadata.author}
          </div>
          <div>{` • `}</div>
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <Link href="/">
            <editable-text data-prop="@data[site].title">{siteMetadata.title}</editable-text>
          </Link>
        </div>
        {site.footerCredit?.trim() && (
          <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            <Link href={site.footerCreditUrl || '/'}>
              <editable-text data-prop="@data[site].footerCredit">
                {site.footerCredit}
              </editable-text>
            </Link>
          </div>
        )}
      </div>
    </footer>
  )
}
