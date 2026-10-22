import Card from '@/components/Card'

export default function ProjectGrid({ projects }) {
  return (
    <div className="container py-12">
      <div className="-m-4 flex flex-wrap" data-editable="array" data-prop="projects">
        {(projects || []).map((project, index) => (
          <Card
            key={index}
            title={project.title}
            description={project.description}
            imgSrc={project.imgSrc}
            href={project.href}
          />
        ))}
      </div>
    </div>
  )
}
