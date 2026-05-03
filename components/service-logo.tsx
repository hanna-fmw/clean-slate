import Image from 'next/image'

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
}

function FallbackLogo({ name }: { name: string }) {
  return (
    <div className="w-full h-full rounded-md bg-muted/50 flex items-center justify-center">
      <span className="text-xs font-medium text-muted-foreground">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export function ServiceLogo({ name, size = 32 }: { name: string; size?: number }) {
  const src = LOGO_MAP[name]
  if (!src) return <div style={{ width: size, height: size }} className="shrink-0"><FallbackLogo name={name} /></div>

  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className="shrink-0 object-contain"
    />
  )
}
