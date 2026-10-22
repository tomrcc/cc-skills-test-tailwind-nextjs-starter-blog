export default function PageHeader({ title, description }) {
  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <h1
        className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100"
        data-editable="text"
        data-prop="title"
      >
        {title}
      </h1>
      {description && (
        <p
          className="text-lg leading-7 text-gray-500 dark:text-gray-400"
          data-editable="text"
          data-prop="description"
        >
          {description}
        </p>
      )}
    </div>
  )
}
