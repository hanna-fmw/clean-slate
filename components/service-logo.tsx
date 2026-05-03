const LOGO_MAP: Record<string, string> = {
  'GitHub': '/logos/github.svg',
  'Supabase': '/logos/supabase.svg',
  'Vercel': '/logos/vercel.svg',
  'Coolify': '/logos/coolify.svg',
  'OpenRouter': '/logos/openrouter.svg',
  'Railway': '/logos/railway.svg',
  'Cloudflare': '/logos/cloudflare.svg',
  'Google Cloud': '/logos/google.svg',
  'Firecrawl': '/logos/firecrawl.svg',
  'Hugging Face': '/logos/huggingface.svg',
  'Sanity': '/logos/sanity.svg',
  'n8n': '/logos/n8n.svg',
  'Stripe': '/logos/stripe.svg',
  'Resend': '/logos/resend.svg',
  'Shopify': '/logos/shopify.svg',
  'Figma': '/logos/figma.svg',
  'Expo': '/logos/expo.svg',
  'Google Workspace': '/logos/google.svg',
  'Proxmox (Homelab)': '/logos/proxmox.svg',
  'Hetzner (Stormfors)': '/logos/hetzner.svg',
  'NetBird VPN': '/logos/netbird.svg',
}

const DARK_LOGOS = new Set([
  'GitHub', 'Vercel', 'Railway', 'OpenRouter', 'Resend', 'Expo',
])

function FallbackLogo({ name }: { name: string }) {
  return (
    <div className="w-full h-full rounded-md bg-muted/50 flex items-center justify-center">
      <span className="text-xs font-medium text-muted-foreground">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export function ServiceLogo({ name, size = 28 }: { name: string; size?: number }) {
  const src = LOGO_MAP[name]

  return (
    <div className="shrink-0" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          className={DARK_LOGOS.has(name) ? 'dark:invert' : undefined}
          style={{ width: size, height: size, objectFit: 'contain' }}
        />
      ) : (
        <FallbackLogo name={name} />
      )}
    </div>
  )
}
