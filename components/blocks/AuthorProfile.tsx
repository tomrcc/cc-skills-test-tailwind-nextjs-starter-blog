import { MDXLayoutRenderer } from 'pliny/mdx-components'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import { findAuthor } from 'lib/authors'
import { contentFile } from 'lib/files'

interface Props {
  heading?: string | null
  author?: string | null
}

// Looks the author up itself, so changing the `author` select re-renders it in the editor.
export default function AuthorProfile({ heading, author }: Props) {
  const details = findAuthor(author)
  const file = details && contentFile(details.filePath)

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        {heading && (
          <h1
            data-editable="text"
            data-prop="heading"
            className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100"
          >
            {heading}
          </h1>
        )}
      </div>
      {details && (
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
          <div className="flex flex-col items-center space-x-2 pt-8">
            {details.avatar && (
              <Image
                src={details.avatar}
                alt="avatar"
                width={192}
                height={192}
                className="h-48 w-48 rounded-full"
                data-editable="image"
                data-prop-src={`@file[${file}].avatar`}
              />
            )}
            <h3
              className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight"
              data-editable="text"
              data-prop={`@file[${file}].name`}
            >
              {details.name}
            </h3>
            {details.occupation && (
              <div
                className="text-gray-500 dark:text-gray-400"
                data-editable="text"
                data-prop={`@file[${file}].occupation`}
              >
                {details.occupation}
              </div>
            )}
            {details.company && (
              <div
                className="text-gray-500 dark:text-gray-400"
                data-editable="text"
                data-prop={`@file[${file}].company`}
              >
                {details.company}
              </div>
            )}
            <div className="flex space-x-3 pt-6">
              <SocialIcon kind="mail" href={`mailto:${details.email}`} />
              <SocialIcon kind="github" href={details.github} />
              <SocialIcon kind="linkedin" href={details.linkedin} />
              <SocialIcon kind="x" href={details.twitter} />
              <SocialIcon kind="bluesky" href={details.bluesky} />
            </div>
          </div>
          <div
            className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2"
            data-editable="text"
            data-type="block"
            data-prop={`@file[${file}].@content`}
          >
            <MDXLayoutRenderer code={details.body.code} />
          </div>
        </div>
      )}
    </div>
  )
}
