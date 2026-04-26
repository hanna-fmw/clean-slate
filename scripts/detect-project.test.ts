import { describe, it, expect } from 'vitest'
import { detectFromPackageJson, detectFromGitConfig, extractStack } from './detect-project'

describe('extractStack', () => {
  it('extracts known frameworks from dependencies', () => {
    const deps = {
      'next': '16.1.0',
      'react': '19.0.0',
      'react-dom': '19.0.0',
      '@prisma/client': '7.0.0',
      'tailwindcss': '4.0.0',
      'typescript': '5.5.0',
    }
    const stack = extractStack(deps)
    expect(stack).toContain('Next.js')
    expect(stack).toContain('Prisma')
    expect(stack).toContain('TypeScript')
    expect(stack).not.toContain('react-dom')
  })

  it('returns empty array for empty deps', () => {
    expect(extractStack({})).toEqual([])
  })
})

describe('detectFromPackageJson', () => {
  it('extracts scripts and stack from package.json content', () => {
    const pkg = {
      scripts: { dev: 'next dev', build: 'next build', test: 'vitest run' },
      dependencies: { next: '16.1.0', react: '19.0.0' },
      devDependencies: { typescript: '5.5.0' },
    }
    const result = detectFromPackageJson(pkg)
    expect(result.run_commands).toEqual({
      'pnpm dev': 'next dev',
      'pnpm build': 'next build',
      'pnpm test': 'vitest run',
    })
    expect(result.stack).toContain('Next.js')
    expect(result.stack).toContain('TypeScript')
  })
})

describe('detectFromGitConfig', () => {
  it('extracts remote URL and SSH alias from git config', () => {
    const config = `[core]
\trepositoryformatversion = 0
[remote "origin"]
\turl = git@github.com-personal:hanna-fmw/json-ld-generator.git
\tfetch = +refs/heads/*:refs/remotes/origin/*
`
    const result = detectFromGitConfig(config)
    expect(result.ssh_alias).toBe('github.com-personal')
    expect(result.repo_url).toBe('https://github.com/hanna-fmw/json-ld-generator')
    expect(result.account).toBe('hanna-fmw')
  })

  it('handles standard github.com remote', () => {
    const config = `[remote "origin"]
\turl = git@github.com:someuser/somerepo.git
`
    const result = detectFromGitConfig(config)
    expect(result.ssh_alias).toBe('github.com')
    expect(result.repo_url).toBe('https://github.com/someuser/somerepo')
    expect(result.account).toBe('someuser')
  })

  it('returns empty for no remote', () => {
    const config = `[core]\n\tbare = false\n`
    const result = detectFromGitConfig(config)
    expect(result.ssh_alias).toBe('')
    expect(result.repo_url).toBe('')
    expect(result.account).toBe('')
  })
})
