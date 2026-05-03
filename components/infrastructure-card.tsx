'use client'

import { useState } from 'react'
import type { Infrastructure } from '@/lib/types'
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

export function InfrastructureCard({ infra }: { infra: Infrastructure }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card
        className="cursor-pointer transition-all hover:ring-foreground/20"
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <CardTitle className="text-sm">{infra.name}</CardTitle>
          {infra.sub_resources.length > 0 && (
            <CardAction>
              <Badge variant="secondary" className="text-[11px]">
                {infra.sub_resources.length} resource{infra.sub_resources.length !== 1 ? 's' : ''}
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {infra.access_url && infra.access_url !== 'TODO' && (
              <MetaRow label="URL">
                <a
                  href={infra.access_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {infra.access_url}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </MetaRow>
            )}
            {infra.login_email && (
              <MetaRow label="Login">
                <p className="font-mono text-xs">{infra.login_email}</p>
              </MetaRow>
            )}
            {infra.nordpass_hint && (
              <MetaRow label="NordPass">
                <p className="font-mono text-xs">{infra.nordpass_hint}</p>
              </MetaRow>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{infra.name}</DialogTitle>
            {infra.sub_resources.length > 0 && (
              <DialogDescription>
                {infra.sub_resources.length} resource{infra.sub_resources.length !== 1 ? 's' : ''}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-5 text-sm">
            {infra.access_url && (
              <MetaRow label="URL">
                <a
                  href={infra.access_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {infra.access_url}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </MetaRow>
            )}

            <div className="grid grid-cols-2 gap-6">
              {infra.login_email && (
                <MetaRow label="Login">
                  <p className="font-mono text-xs">{infra.login_email}</p>
                </MetaRow>
              )}
              {infra.nordpass_hint && (
                <MetaRow label="NordPass">
                  <p className="font-mono text-xs">{infra.nordpass_hint}</p>
                </MetaRow>
              )}
            </div>

            {infra.notes && (
              <MetaRow label="Notes">
                <p className="text-muted-foreground whitespace-pre-line">{infra.notes}</p>
              </MetaRow>
            )}

            {infra.sub_resources.length > 0 && (
              <MetaRow label="Resources">
                <div className="space-y-2 mt-1">
                  {infra.sub_resources.map((r, i) => (
                    <Card key={i} size="sm" className="bg-muted/30">
                      <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs">
                          <span className="font-mono font-medium shrink-0">{r.name}</span>
                          <span className="text-muted-foreground">{r.purpose}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </MetaRow>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
