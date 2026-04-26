import rawData from '@/config/data.json'
import type { DashboardData } from './types'

export function getData(): DashboardData {
  return rawData as DashboardData
}
