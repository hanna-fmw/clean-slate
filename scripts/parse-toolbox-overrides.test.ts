import { describe, it, expect } from 'vitest'
import { parseOverrides } from './parse-toolbox-overrides'

const SAMPLE = `# Toolbox Overrides

## Pinned

- deep-research (skill)
- Frontend Developer (agent)
- \`context7\` (mcp)

## One-liners

- deep-research: When you need multi-source fact-checked research.
- Frontend Developer: React/Next.js implementation specialist.

## Category map

- Content/Research -> Content & Research
- content & research → Content & Research
- ui -> Frontend

## Defaults

- compound-engineering: Engineering Workflow
`

describe('parseOverrides', () => {
  const result = parseOverrides(SAMPLE)

  it('parses pinned entries with type', () => {
    expect(result.pinned).toEqual([
      { name: 'deep-research', type: 'skill' },
      { name: 'Frontend Developer', type: 'agent' },
      { name: 'context7', type: 'mcp' },
    ])
  })

  it('parses one-liner overrides', () => {
    expect(result.one_liners).toEqual({
      'deep-research': 'When you need multi-source fact-checked research.',
      'Frontend Developer': 'React/Next.js implementation specialist.',
    })
  })

  it('parses category map with arrow and ASCII arrow', () => {
    expect(result.category_map).toEqual({
      'Content/Research': 'Content & Research',
      'content & research': 'Content & Research',
      'ui': 'Frontend',
    })
  })

  it('parses defaults', () => {
    expect(result.defaults).toEqual({
      'compound-engineering': 'Engineering Workflow',
    })
  })
})

describe('parseOverrides empty file', () => {
  it('returns empty structure', () => {
    const result = parseOverrides('')
    expect(result).toEqual({ pinned: [], one_liners: {}, category_map: {}, defaults: {} })
  })
})
