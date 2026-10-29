import Link from './Link'
import site from '@/data/settings/site.json'
import SocialIcon from '@/components/social-icons'

type SiteSettings = typeof site

// Registered for the Visual Editor, so it renders from the site settings it is given.
export function FooterContent({
  email,
  github,
  facebook,
  youtube,
  linkedin,
  twitter,
  bluesky,
  x,
  instagram,
  threads,
  medium,
  author,
  title,
  themeCredit,
}: Partial<SiteSettings>) {
  return (
    <div className="mt-16 flex flex-col items-center">
      <div className="mb-3 flex space-x-4">
        <SocialIcon kind="mail" href={`mailto:${email}`} size={6} />
        <SocialIcon kind="github" href={github} size={6} />
        <SocialIcon kind="facebook" href={facebook} size={6} />
        <SocialIcon kind="youtube" href={youtube} size={6} />
        <SocialIcon kind="linkedin" href={linkedin} size={6} />
        <SocialIcon kind="twitter" href={twitter} size={6} />
        <SocialIcon kind="bluesky" href={bluesky} size={6} />
        <SocialIcon kind="x" href={x} size={6} />
        <SocialIcon kind="instagram" href={instagram} size={6} />
        <SocialIcon kind="threads" href={threads} size={6} />
        <SocialIcon kind="medium" href={medium} size={6} />
      </div>
      <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
        {author && (
          <div data-editable="text" data-prop="author">
            {author}
          </div>
        )}
        <div>{` • `}</div>
        <div>{`© ${new Date().getFullYear()}`}</div>
        <div>{` • `}</div>
        <Link href="/">{title && <editable-text data-prop="title">{title}</editable-text>}</Link>
      </div>
      <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        {themeCredit?.text && (
          <Link href={themeCredit.href || '/'}>
            <editable-text data-prop="themeCredit.text">{themeCredit.text}</editable-text>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer data-editable="component" data-component="footer" data-prop="@data[site]">
      <FooterContent {...site} />
    </footer>
  )
}
