import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  // Front matter key the title comes from, when it is editable on this page
  editableProp?: string
}

export default function PageTitle({ children, editableProp }: Props) {
  return (
    <h1
      className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 dark:text-gray-100"
      {...(editableProp && { 'data-editable': 'text', 'data-prop': editableProp })}
    >
      {children}
    </h1>
  )
}
