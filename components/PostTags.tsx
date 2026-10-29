import Tag from './Tag'

// Registered for the Visual Editor, so tag edits in the sidebar re-render the links.
export default function PostTags({ tags }: { tags?: string[] | null }) {
  return (
    <>
      {(tags ?? []).map((tag) => (
        <Tag key={tag} text={tag} />
      ))}
    </>
  )
}
