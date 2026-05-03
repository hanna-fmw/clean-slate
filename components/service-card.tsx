'use client'

import { useState } from 'react'
import type { Service } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ServiceLogo } from './service-logo'

const CATEGORY_COLORS: Record<string, string> = {
  'cloud-platform': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  database: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  hosting: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  ai: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  cms: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  automation: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  payments: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  email: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  design: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  ecommerce: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  mobile: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  productivity: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  'dev-tools': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  scraping: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
}

function categoryColor(category: string) {
  return CATEGORY_COLORS[category] || 'bg-secondary text-secondary-foreground border-transparent'
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function ServiceCard({ service }: { service: Service }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card
        className="cursor-pointer transition-all hover:ring-foreground/20"
        onClick={() => setOpen(true)}
      >
        <CardContent className="flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <ServiceLogo name={service.name} size={32} />
            <Badge variant="outline" className={`text-[11px] ${categoryColor(service.category)}`}>
              {service.category}
            </Badge>
          </div>
          <div className="flex justify-between items-end">
            <div className="min-w-0">
              {service.url && (
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {service.url}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
              {service.subscription && (
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                  <span className="rounded-full bg-blue-500" style={{ width: 'var(--dot-size)', height: 'var(--dot-size)' }} />
                  Paid
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">
              {service.accounts.length} account{service.accounts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-[var(--space-gap)]">
              <ServiceLogo name={service.name} size={36} />
              <div>
                <DialogTitle className="text-lg">{service.name}</DialogTitle>
                <DialogDescription>
                  <span className="inline-flex gap-2 items-center mt-1">
                    <Badge variant="outline" className={`text-[11px] ${categoryColor(service.category)}`}>
                      {service.category}
                    </Badge>
                    {service.subscription && (
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="rounded-full bg-blue-500" style={{ width: 'var(--dot-size)', height: 'var(--dot-size)' }} />
                        Paid
                      </span>
                    )}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            {service.url && (
              <div>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {service.url}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            )}

            <MetaRow label="Accounts">
              <div className="space-y-3 mt-1">
                {service.accounts.map((account, i) => (
                  <Card key={i} size="sm" className="bg-secondary/50">
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-[var(--space-gap)]">
                        <span className="flex items-center gap-1.5">
                          <span className="rounded-full bg-emerald-500" style={{ width: 'var(--dot-size)', height: 'var(--dot-size)' }} />
                          <span className="font-medium text-xs">{account.alias || 'Account'}</span>
                        </span>
                        {account.username && (
                          <span className="font-mono text-xs text-muted-foreground">@{account.username}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                        {account.email && (
                          <>
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-mono">{account.email}</span>
                          </>
                        )}
                        {account.chrome_profile && (
                          <>
                            <span className="text-muted-foreground">Chrome</span>
                            <span className="font-mono">{account.chrome_profile}</span>
                          </>
                        )}
                        {account.use_for && (
                          <>
                            <span className="text-muted-foreground">Use for</span>
                            <span>{account.use_for}</span>
                          </>
                        )}
                        {account.nordpass_hint && (
                          <>
                            <span className="text-muted-foreground">NordPass</span>
                            <span className="font-mono">{account.nordpass_hint}</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </MetaRow>

            {service.notes && (
              <MetaRow label="Notes">
                <p className="text-muted-foreground whitespace-pre-line">{service.notes}</p>
              </MetaRow>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
