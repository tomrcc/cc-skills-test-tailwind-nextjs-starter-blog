import Image from './Image'
import Link from './Link'

// One item of a project_grid block's `items` array; region paths are relative to the item.
const Card = ({ title, description, imgSrc, href }) => {
  const image = imgSrc && (
    <Image
      alt={title}
      src={imgSrc}
      className="object-cover object-center md:h-36 lg:h-48"
      width={544}
      height={306}
      data-editable="image"
      data-prop-src="imgSrc"
    />
  )
  const titleText = title && <editable-text data-prop="title">{title}</editable-text>

  return (
    <div className="md max-w-[544px] p-4 md:w-1/2" data-editable="array-item">
      <div
        className={`${
          imgSrc && 'h-full'
        } overflow-hidden rounded-md border-2 border-gray-200/60 dark:border-gray-700/60`}
      >
        {image &&
          (href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {image}
            </Link>
          ) : (
            image
          ))}
        <div className="p-6">
          <h2 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
            {href ? (
              <Link href={href} aria-label={`Link to ${title}`}>
                {titleText}
              </Link>
            ) : (
              titleText
            )}
          </h2>
          {description && (
            <p
              className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400"
              data-editable="text"
              data-prop="description"
            >
              {description}
            </p>
          )}
          {href && (
            <Link
              href={href}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
              aria-label={`Link to ${title}`}
            >
              Learn more &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Card
