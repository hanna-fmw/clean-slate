import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatRelativeTime } from './format'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-26T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns "today" for the current date', () => {
    expect(formatRelativeTime('2026-04-26T10:00:00Z')).toBe('today')
  })

  it('returns "yesterday" for 1 day ago', () => {
    expect(formatRelativeTime('2026-04-25T10:00:00Z')).toBe('yesterday')
  })

  it('returns "3 days ago" for 3 days ago', () => {
    expect(formatRelativeTime('2026-04-23T10:00:00Z')).toBe('3 days ago')
  })

  it('returns "2 weeks ago" for 14 days ago', () => {
    expect(formatRelativeTime('2026-04-12T10:00:00Z')).toBe('2 weeks ago')
  })

  it('returns "1 month ago" for 35 days ago', () => {
    expect(formatRelativeTime('2026-03-22T10:00:00Z')).toBe('1 month ago')
  })

  it('returns "3 months ago" for 95 days ago', () => {
    expect(formatRelativeTime('2026-01-21T10:00:00Z')).toBe('3 months ago')
  })

  it('returns empty string for empty input', () => {
    expect(formatRelativeTime('')).toBe('')
  })
})
