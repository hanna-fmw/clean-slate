import { getData } from '@/lib/data'
import { ProjectCard } from '@/components/project-card'
import { ServiceRow } from '@/components/service-row'
import { InfrastructureRow } from '@/components/infrastructure-row'
import { ToolsSection } from '@/components/tools-section'
import { DashboardLayout } from './dashboard-layout'

export default function Home() {
  const { projects, services, infrastructure, tools } = getData()

  return (
    <DashboardLayout
      counts={{
        projects: projects.length,
        services: services.length,
        infrastructure: infrastructure.length,
        tools: (tools?.agents.length ?? 0) + (tools?.plugins.length ?? 0) + (tools?.mcp_servers.length ?? 0) + (tools?.skills.length ?? 0),
      }}
      projectList={
        <div className="grid gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
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
      toolsList={
        tools ? (
          <ToolsSection tools={tools} />
        ) : (
          <p className="text-sm text-[var(--muted)] py-4">
            No tools inventory yet. Run: npx tsx scripts/sync-tools.ts
          </p>
        )
      }
    />
  )
}
