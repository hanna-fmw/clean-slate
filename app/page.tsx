import { getData } from '@/lib/data'
import { Header } from '@/components/header'
import { ProjectRow } from '@/components/project-row'

export default function Home() {
  const { projects } = getData()

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Header projectCount={projects.length} />
      <div>
        {projects.map((project) => (
          <ProjectRow key={project.name} project={project} />
        ))}
      </div>
    </main>
  )
}
