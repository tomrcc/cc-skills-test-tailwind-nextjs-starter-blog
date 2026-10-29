import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import type { LatestPost } from 'lib/pages'
import { contentFile } from 'lib/files'

interface Props {
  count?: number | null
  // From the blog collection, newest first. Blocks also passes it as data-literal-posts.
  posts?: LatestPost[]
}

export default function LatestPosts({ count, posts = [] }: Props) {
  const max = count ?? 5
  return (
    <>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {!posts.length && 'No posts found.'}
        {posts.slice(0, max).map((post) => {
          const { slug, date, title, summary, tags, filePath } = post
          const file = contentFile(filePath)
          return (
            <li key={slug} className="py-12">
              <article>
                <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <dl>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-5 xl:col-span-3">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl leading-8 font-bold tracking-tight">
                          <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                            {title && (
                              <editable-text data-prop={`@file[${file}].title`}>
                                {title}
                              </editable-text>
                            )}
                          </Link>
                        </h2>
                        <div className="flex flex-wrap">
                          {tags.map((tag) => (
                            <Tag key={tag} text={tag} />
                          ))}
                        </div>
                      </div>
                      {summary && (
                        <div
                          className="prose max-w-none text-gray-500 dark:text-gray-400"
                          data-editable="text"
                          data-prop={`@file[${file}].summary`}
                        >
                          {summary}
                        </div>
                      )}
                    </div>
                    <div className="text-base leading-6 font-medium">
                      <Link
                        href={`/blog/${slug}`}
                        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                        aria-label={`Read more: "${title}"`}
                      >
                        Read more &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
      {posts.length > max && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
