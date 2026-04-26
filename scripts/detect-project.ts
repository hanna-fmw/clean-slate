const KNOWN_STACK: Record<string, string> = {
  'next': 'Next.js',
  'react': 'React',
  'vue': 'Vue',
  'express': 'Express',
  '@prisma/client': 'Prisma',
  'prisma': 'Prisma',
  'drizzle-orm': 'Drizzle',
  '@supabase/supabase-js': 'Supabase',
  'stripe': 'Stripe',
  'openai': 'OpenAI',
  'langchain': 'LangChain',
  '@langchain/langgraph': 'LangGraph',
  'tailwindcss': 'Tailwind CSS',
  'typescript': 'TypeScript',
  'expo': 'Expo',
  'react-native': 'React Native',
  'docker-compose': 'Docker',
  'pg': 'PostgreSQL',
  '@neondatabase/serverless': 'Neon',
  'mongoose': 'MongoDB',
  'redis': 'Redis',
  'ioredis': 'Redis',
}

export function extractStack(deps: Record<string, string>): string[] {
  const found = new Set<string>()
  for (const dep of Object.keys(deps)) {
    if (KNOWN_STACK[dep]) found.add(KNOWN_STACK[dep])
  }
  return Array.from(found).sort()
}

export function detectFromPackageJson(pkg: {
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}): { run_commands: Record<string, string>; stack: string[] } {
  const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
  const stack = extractStack(allDeps)

  const run_commands: Record<string, string> = {}
  const usefulScripts = ['dev', 'build', 'start', 'test', 'lint', 'sync', 'seed', 'migrate']
  for (const [name, cmd] of Object.entries(pkg.scripts ?? {})) {
    if (usefulScripts.includes(name)) {
      run_commands[`pnpm ${name}`] = cmd
    }
  }

  return { run_commands, stack }
}

export function detectFromGitConfig(configContent: string): {
  ssh_alias: string
  repo_url: string
  account: string
} {
  const match = configContent.match(/url\s*=\s*git@([^:]+):([^/]+)\/(.+?)(?:\.git)?\s*$/m)
  if (!match) return { ssh_alias: '', repo_url: '', account: '' }

  const [, host, user, repo] = match
  return {
    ssh_alias: host,
    repo_url: `https://github.com/${user}/${repo}`,
    account: user,
  }
}
