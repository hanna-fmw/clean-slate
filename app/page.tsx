import { getData } from '@/lib/data'
import { ProjectCard } from '@/components/project-card'
import { ServiceCard } from '@/components/service-card'
import { ToolsSectionCards } from '@/components/tools-section-cards'
import { ToolboxView } from '@/components/toolbox-view'
import { ReferenceView } from '@/components/reference-view'
import { ApiKeysView } from '@/components/api-keys-view'
import { DashboardLayout } from './dashboard-layout'
import type { Service } from '@/lib/types'

const INFRA_CATEGORIES: Record<string, string> = {
  'Proxmox (Homelab)': 'Infrastructure',
  'Hetzner (Stormfors)': 'Infrastructure',
  'NetBird VPN': 'Networking',
}

const SKIP_INFRA = new Set(['Domains (Cloudflare)'])

function infraToService(infra: { name: string; access_url: string; login_email: string; nordpass_hint: string; notes: string; sub_resources: { name: string; purpose: string }[]; last_reviewed: string }): Service {
  return {
    name: infra.name,
    category: INFRA_CATEGORIES[infra.name] || 'Infrastructure',
    url: infra.access_url !== 'TODO' ? infra.access_url : '',
    subscription: false,
    receipt_email: '',
    accounts: infra.sub_resources.map((r) => ({
      alias: r.name,
      username: '',
      email: infra.login_email !== 'TODO' ? infra.login_email : '',
      chrome_profile: '',
      use_for: r.purpose,
      nordpass_hint: '',
    })),
    notes: infra.notes,
    last_reviewed: infra.last_reviewed,
  }
}

export default function Home() {
  const { projects, services, infrastructure, tools, toolbox, reference, api_keys } = getData()

  const allServices = [
    ...services,
    ...infrastructure.filter((i) => !SKIP_INFRA.has(i.name)).map(infraToService),
  ]

  return (
    <DashboardLayout
      counts={{
        projects: projects.length,
        services: allServices.length,
        tools: (tools?.agents.length ?? 0) + (tools?.plugins.length ?? 0) + (tools?.mcp_servers.length ?? 0) + (tools?.skills.length ?? 0),
        toolbox: toolbox?.length ?? 0,
        reference: reference?.groups.reduce((sum, g) => sum + g.items.length, 0) ?? 0,
        'api-keys': api_keys?.length ?? 0,
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
          {allServices.map((service) => (
            <ServiceCard key={service.name} service={service} />
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
      toolboxList={<ToolboxView toolbox={toolbox ?? []} />}
      referenceList={<ReferenceView reference={reference} />}
      apiKeysList={<ApiKeysView entries={api_keys ?? []} />}
      searchData={{ projects, services: allServices, tools, toolbox, reference }}
    />
  )
}
