import Card from '@/components/Card'

interface Project {
  title?: string | null
  description?: string | null
  imgSrc?: string | null
  href?: string | null
}

export default function ProjectGrid({ items }: { items?: Project[] | null }) {
  return (
    <div className="container py-12">
      <div className="-m-4 flex flex-wrap" data-editable="array" data-prop="items">
        {(items ?? []).map((item, index) => (
          <Card
            key={index}
            title={item.title}
            description={item.description}
            imgSrc={item.imgSrc}
            href={item.href}
          />
        ))}
      </div>
    </div>
  )
}
