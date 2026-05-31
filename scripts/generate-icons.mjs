import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'icons')

const content = `
  <rect width="32" height="32" fill="#0a0a0a"/>
  <path d="M8 10h16M8 16h10M8 22h13" stroke="#ededed" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="24" cy="22" r="3" fill="#3ECF8E"/>
`

// "any" icons are full-bleed; maskable adds a safe-zone margin (content scaled to inner 80%)
const svg = (size, maskable) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#0a0a0a"/>
  <g transform="${maskable ? 'translate(3.2 3.2) scale(0.8)' : ''}">${content}</g>
</svg>`

const targets = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  { name: 'apple-icon.png', size: 180, maskable: false },
]

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage()

for (const { name, size, maskable } of targets) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(svg(size, maskable), { waitUntil: 'load' })
  const png = await page.locator('svg').screenshot({ omitBackground: false })
  await writeFile(join(out, name), png)
  console.log(`wrote public/icons/${name} (${size}x${size}${maskable ? ', maskable' : ''})`)
}

await browser.close()
