import Image from './Image'
import Link from './Link'
import { findAuthor } from 'lib/authors'
import { contentFile } from 'lib/files'

// Registered for the Visual Editor: looks the slugs up itself so the authors select re-renders it.
export default function PostAuthors({ authors }: { authors?: string[] | null }) {
  const slugs = authors?.length ? authors : ['default']
  const details = slugs.map(findAuthor).filter((author) => author !== undefined)

  return (
    <>
      {details.map((author) => {
        const file = contentFile(author.filePath)
        return (
          <li className="flex items-center space-x-2" key={author.slug}>
            {author.avatar && (
              <Image
                src={author.avatar}
                width={38}
                height={38}
                alt="avatar"
                className="h-10 w-10 rounded-full"
                data-editable="image"
                data-prop-src={`@file[${file}].avatar`}
              />
            )}
            <dl className="text-sm leading-5 font-medium whitespace-nowrap">
              <dt className="sr-only">Name</dt>
              <dd
                className="text-gray-900 dark:text-gray-100"
                data-editable="text"
                data-prop={`@file[${file}].name`}
              >
                {author.name}
              </dd>
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
        )
      })}
    </>
  )
}
