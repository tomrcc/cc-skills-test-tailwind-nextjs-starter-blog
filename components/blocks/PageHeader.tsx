interface Props {
  title?: string | null
  description?: string | null
}

export default function PageHeader({ title, description }: Props) {
  return (
    <div className="space-y-2 border-b border-gray-200 pt-6 pb-8 md:space-y-5 dark:border-gray-700">
      {title && (
        <h1
          data-editable="text"
          data-prop="title"
          className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100"
        >
          {title}
        </h1>
      )}
      {description && (
        <p
          data-editable="text"
          data-prop="description"
          className="text-lg leading-7 text-gray-500 dark:text-gray-400"
        >
          {description}
        </p>
      )}
    </div>
  )
}
