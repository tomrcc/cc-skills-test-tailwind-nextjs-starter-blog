import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import RawTemplate from './RawTemplate'

const linkClass =
  'hover:text-primary-500 dark:hover:text-primary-400 m-1 font-medium text-gray-900 dark:text-gray-100'

const NAV_LINK_BLUEPRINT = `<a data-editable="array-item" class="${linkClass}"><editable-text data-prop="title"></editable-text></a>`

const Header = () => {
  let headerClass = 'flex items-center w-full bg-white dark:bg-gray-950 justify-between py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteMetadata.headerTitle}>
        <div className="flex items-center justify-between">
          <div className="mr-3">
            <Logo />
          </div>
          {typeof siteMetadata.headerTitle === 'string' ? (
            <div
              className="hidden h-6 text-2xl font-semibold sm:block"
              data-editable="text"
              data-prop="@data[site].headerTitle"
            >
              {siteMetadata.headerTitle}
            </div>
          ) : (
            siteMetadata.headerTitle
          )}
        </div>
      </Link>
      <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
        <div
          className="no-scrollbar hidden max-w-40 items-center gap-x-4 overflow-x-auto sm:flex md:max-w-72 lg:max-w-96"
          data-editable="array"
          data-prop="@data[navigation].items"
        >
          {/* Every item renders so array positions match the data; the logo already links home. */}
          {headerNavLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={link.href === '/' ? `${linkClass} hidden` : linkClass}
              data-editable="array-item"
            >
              {link.title && <editable-text data-prop="title">{link.title}</editable-text>}
            </Link>
          ))}
          <RawTemplate html={NAV_LINK_BLUEPRINT} />
        </div>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
