'use client'

import { useState } from 'react'
import type { Service } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

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
        <CardHeader>
          <CardTitle className="text-sm">{service.name}</CardTitle>
          <CardAction>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">{service.category}</Badge>
              {service.subscription && (
                <Badge variant="outline" className="text-[11px]">Paid</Badge>
              )}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {service.url && (
              <MetaRow label="URL">
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {service.url}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </MetaRow>
            )}
            <MetaRow label="Accounts">
              <p>{service.accounts.length} account{service.accounts.length !== 1 ? 's' : ''}</p>
            </MetaRow>
            {service.receipt_email && (
              <MetaRow label="Receipt Email">
                <p className="font-mono text-xs">{service.receipt_email}</p>
              </MetaRow>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{service.name}</DialogTitle>
            <DialogDescription>
              <span className="inline-flex gap-2 items-center">
                <Badge variant="secondary" className="text-[11px]">{service.category}</Badge>
                {service.subscription && <Badge variant="outline" className="text-[11px]">Paid</Badge>}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            {service.url && (
              <MetaRow label="URL">
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
              </MetaRow>
            )}

            <MetaRow label="Accounts">
              <div className="space-y-3 mt-1">
                {service.accounts.map((account, i) => (
                  <Card key={i} size="sm" className="bg-muted/30">
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-xs">{account.alias || 'Account'}</span>
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
