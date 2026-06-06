import { describe, it, expect } from 'vitest'
import { parseApiKeyFile } from './parse-api-keys'

const FULL = `---
provider: Anthropic
vault_ref: "TODO — folder/entry in NordPass"
vault_url: https://my.nordpass.com
billingUrl: https://console.anthropic.com/settings/billing
keysUrl: https://console.anthropic.com/settings/keys
spendLimit: "$20/mo"
spendLimitSet: true
lastRotated: 2026-03-15
projects:
  - signal-stack
  - clean-slate
---

Personal key. Hard cap.
`

const EMPTY_LIST = `---
provider: OpenAI
spendLimitSet: false
projects: []
---

TODO
`

const NO_FRONTMATTER = `# just a markdown file`

describe('parseApiKeyFile', () => {
  it('parses a complete entry', () => {
    const r = parseApiKeyFile(FULL)
    expect(r).not.toBeNull()
    expect(r!.provider).toBe('Anthropic')
    expect(r!.vault_ref).toBe('TODO — folder/entry in NordPass')
    expect(r!.vault_url).toBe('https://my.nordpass.com')
    expect(r!.spendLimit).toBe('$20/mo')
    expect(r!.spendLimitSet).toBe(true)
    expect(r!.projects).toEqual(['signal-stack', 'clean-slate'])
    expect(r!.notes).toBe('Personal key. Hard cap.')
  })

  it('handles empty list and false bool', () => {
    const r = parseApiKeyFile(EMPTY_LIST)
    expect(r!.provider).toBe('OpenAI')
    expect(r!.spendLimitSet).toBe(false)
    expect(r!.projects).toEqual([])
  })

  it('returns null when no provider', () => {
    expect(parseApiKeyFile(NO_FRONTMATTER)).toBeNull()
  })
})
