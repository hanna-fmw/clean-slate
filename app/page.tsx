import { getData } from '@/lib/data'
import { Header } from '@/components/header'
import { ProjectRow } from '@/components/project-row'
import { ServiceRow } from '@/components/service-row'
import { InfrastructureRow } from '@/components/infrastructure-row'
import { DashboardTabs } from './dashboard-tabs'

export default function Home() {
  const { projects, services, infrastructure } = getData()

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Header />
      <DashboardTabs
        counts={{
          projects: projects.length,
          services: services.length,
          infrastructure: infrastructure.length,
        }}
        projectList={
          <div>
            {projects.map((project) => (
              <ProjectRow key={project.name} project={project} />
            ))}
          </div>
        }
        serviceList={
          <div>
            {services.map((service) => (
              <ServiceRow key={service.name} service={service} />
            ))}
          </div>
        }
        infrastructureList={
          <div>
            {infrastructure.map((infra) => (
              <InfrastructureRow key={infra.name} infra={infra} />
            ))}
          </div>
        }
      />
    </main>
  )
}
