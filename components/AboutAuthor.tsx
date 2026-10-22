import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import SocialIcon from './social-icons'
import Image from './Image'

// Registered: the lookup runs here so a changed `author` select re-renders in the editor.
// Fields bind to the author's own file, so edits save there.
export default function AboutAuthor({ author: slug }: { author: string }) {
  const author = allAuthors.find((a) => a.slug === slug)
  if (!author) throw new Error(`No author "${slug}" in data/authors`)
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = author
  const file = `@file[/data/${author.filePath}]`

  return (
    <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
      <div className="flex flex-col items-center space-x-2 pt-8">
        {avatar && (
          <Image
            src={avatar}
            alt="avatar"
            width={192}
            height={192}
            className="h-48 w-48 rounded-full"
            data-editable="image"
            data-prop-src={`${file}.avatar`}
          />
        )}
        <h3
          className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight"
          data-editable="text"
          data-prop={`${file}.name`}
        >
          {name}
        </h3>
        <div
          className="text-gray-500 dark:text-gray-400"
          data-editable="text"
          data-prop={`${file}.occupation`}
        >
          {occupation}
        </div>
        <div
          className="text-gray-500 dark:text-gray-400"
          data-editable="text"
          data-prop={`${file}.company`}
        >
          {company}
        </div>
        <div className="flex space-x-3 pt-6">
          <SocialIcon kind="mail" href={`mailto:${email}`} />
          <SocialIcon kind="github" href={github} />
          <SocialIcon kind="linkedin" href={linkedin} />
          <SocialIcon kind="x" href={twitter} />
          <SocialIcon kind="bluesky" href={bluesky} />
        </div>
      </div>
      <div
        className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2"
        data-editable="text"
        data-type="block"
        data-prop={`${file}.@content`}
      >
        <MDXLayoutRenderer code={author.body.code} />
      </div>
    </div>
  )
}
