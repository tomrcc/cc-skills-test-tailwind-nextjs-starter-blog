import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
}

export default function AuthorLayout({ children, title }: Props) {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1
            className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100"
            data-editable="text"
            data-prop="title"
          >
            {title}
          </h1>
        </div>
        {children}
      </div>
    </>
  )
}
