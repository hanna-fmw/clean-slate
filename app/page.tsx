import { getData } from '@/lib/data'
import { ProjectCard } from '@/components/project-card'
import { ServiceCard } from '@/components/service-card'
import { InfrastructureCard } from '@/components/infrastructure-card'
import { ToolsSectionCards } from '@/components/tools-section-cards'
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
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      }
      serviceList={
        <div className="flex flex-wrap gap-3 [&>*]:w-full [&>*]:sm:w-[calc(50%-0.375rem)]">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      }
      infrastructureList={
        <div className="space-y-3">
          {infrastructure.map((infra) => (
            <InfrastructureCard key={infra.name} infra={infra} />
          ))}
        </div>
      }
      toolsList={
        tools ? (
          <ToolsSectionCards tools={tools} />
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            No tools inventory yet. Run: npx tsx scripts/sync-tools.ts
          </p>
        )
      }
    />
  )
}
