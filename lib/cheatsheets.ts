import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

export interface Cheatsheet {
  slug: string
  title: string
  file: string
  publicPath: string
  updatedAt: string
  bodyHtml: string
}

const DIR = join(process.cwd(), 'public', 'cheatsheets')

function extractTitle(html: string, fallback: string): string {
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleTag) return titleTag[1].trim()
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1) return h1[1].trim()
  return fallback
}

function extractBody(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return m ? m[1].trim() : html
}

export function getCheatsheets(): Cheatsheet[] {
  let entries: string[]
  try {
    entries = readdirSync(DIR)
  } catch {
    return []
  }
  return entries
    .filter(f => f.endsWith('.html'))
    .map(file => {
      const full = join(DIR, file)
      const html = readFileSync(full, 'utf8')
      const slug = file.replace(/\.html$/, '')
      return {
        slug,
        title: extractTitle(html, slug),
        file,
        publicPath: `/cheatsheets/${file}`,
        updatedAt: statSync(full).mtime.toISOString(),
        bodyHtml: extractBody(html),
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}
