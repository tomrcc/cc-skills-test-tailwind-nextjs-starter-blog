import { allAuthors } from 'contentlayer/generated'
import Image from './Image'
import Link from './Link'

// Registered: the lookup runs here so a changed `authors` select re-renders in the editor.
export default function PostAuthors({ authors }: { authors?: string[] | null }) {
  const slugs = authors?.length ? authors : ['default']
  const authorDetails = slugs
    .map((slug) => allAuthors.find((a) => a.slug === slug))
    .filter((author) => author !== undefined)

  return (
    <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0">
      {authorDetails.map((author) => (
        <li className="flex items-center space-x-2" key={author.name}>
          {author.avatar && (
            <Image
              src={author.avatar}
              width={38}
              height={38}
              alt="avatar"
              className="h-10 w-10 rounded-full"
            />
          )}
          <dl className="text-sm leading-5 font-medium whitespace-nowrap">
            <dt className="sr-only">Name</dt>
            <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
            <dt className="sr-only">Twitter</dt>
            <dd>
              {author.twitter && (
                <Link
                  href={author.twitter}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {author.twitter
                    .replace('https://twitter.com/', '@')
                    .replace('https://x.com/', '@')}
                </Link>
              )}
            </dd>
          </dl>
        </li>
      ))}
    </ul>
  )
}
