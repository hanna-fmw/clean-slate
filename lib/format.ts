export function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return ''
  const now = new Date()
  const then = new Date(isoDate)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 14) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  const months = Math.floor(diffDays / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}
