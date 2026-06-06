import rawData from '@/config/data.json'
import type { DashboardData } from './types'

export function getData(): DashboardData {
  const data = rawData as Partial<DashboardData>
  return {
    generated_at: data.generated_at ?? '',
    projects: data.projects ?? [],
    services: data.services ?? [],
    infrastructure: data.infrastructure ?? [],
    tools: data.tools,
    toolbox: data.toolbox,
    reference: data.reference,
    api_keys: data.api_keys,
  }
}
