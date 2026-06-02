import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { findProjectRoots, displayPath } from './sync'

describe('findProjectRoots', () => {
  let tmp: string

  beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-sync-'))
    // A nested project root
    fs.mkdirSync(path.join(tmp, 'projects', 'alpha'), { recursive: true })
    fs.writeFileSync(path.join(tmp, 'projects', 'alpha', 'CLEAN-SLATE.md'), '# Alpha')
    // A deeper nested project root
    fs.mkdirSync(path.join(tmp, 'projects', 'group', 'beta'), { recursive: true })
    fs.writeFileSync(path.join(tmp, 'projects', 'group', 'beta', 'CLEAN-SLATE.md'), '# Beta')
    // node_modules must be ignored even if it contains a CLEAN-SLATE.md
    fs.mkdirSync(path.join(tmp, 'projects', 'alpha', 'node_modules', 'pkg'), { recursive: true })
    fs.writeFileSync(path.join(tmp, 'projects', 'alpha', 'node_modules', 'pkg', 'CLEAN-SLATE.md'), '# Nope')
    // A folder with no CLEAN-SLATE.md
    fs.mkdirSync(path.join(tmp, 'projects', 'empty'), { recursive: true })
  })

  afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it('finds CLEAN-SLATE.md at any depth', () => {
    const roots = findProjectRoots(path.join(tmp, 'projects')).sort()
    expect(roots).toEqual([
      path.join(tmp, 'projects', 'alpha'),
      path.join(tmp, 'projects', 'group', 'beta'),
    ])
  })

  it('does not descend into a project root once found (skips its node_modules)', () => {
    const roots = findProjectRoots(path.join(tmp, 'projects'))
    expect(roots.some((r) => r.includes('node_modules'))).toBe(false)
  })

  it('returns empty for a missing directory', () => {
    expect(findProjectRoots(path.join(tmp, 'does-not-exist'))).toEqual([])
  })
})

describe('displayPath', () => {
  it('abbreviates the home directory to ~', () => {
    const home = process.env.HOME ?? ''
    expect(displayPath(path.join(home, 'Documents', 'projects', 'foo'))).toBe('~/Documents/projects/foo')
  })
})
