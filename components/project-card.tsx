'use client'

import { useState } from 'react'
import { formatRelativeTime } from '@/lib/format'
import type { Project } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const GRADIENTS = [
  'from-blue-500/10 to-purple-500/10',
  'from-emerald-500/10 to-teal-500/10',
  'from-orange-500/10 to-rose-500/10',
  'from-violet-500/10 to-indigo-500/10',
  'from-cyan-500/10 to-blue-500/10',
  'from-pink-500/10 to-red-500/10',
  'from-amber-500/10 to-yellow-500/10',
  'from-lime-500/10 to-green-500/10',
]

function hashIndex(name: string, len: number): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return Math.abs(h) % len
}

function ProjectPreview({ name, stack }: { name: string; stack: string[] }) {
  const gradient = GRADIENTS[hashIndex(name, GRADIENTS.length)]
  return (
    <div className={`w-full h-full min-h-[180px] rounded-lg border border-border/50 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3 p-6`}>
      <span className="text-3xl font-medium opacity-20">
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="flex flex-wrap gap-1 justify-center">
        {stack.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] font-mono opacity-30 bg-foreground/5 px-1.5 py-0.5 rounded">
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card
        className="cursor-pointer transition-all hover:ring-foreground/20"
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <CardTitle className="text-base">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="w-[280px] shrink-0">
              <ProjectPreview name={project.name} stack={project.stack} />
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <MetaRow label="Description">
                <p className="text-muted-foreground leading-relaxed">{project.description_short}</p>
              </MetaRow>

              {project.hosting && (
                <div className="flex gap-8">
                  <MetaRow label="Hosting">
                    <p>{project.hosting}</p>
                  </MetaRow>
                  {project.database && (
                    <MetaRow label="Database">
                      <p>{project.database}</p>
                    </MetaRow>
                  )}
                </div>
              )}

              <MetaRow label="Stack">
                <div className="flex gap-1.5 flex-wrap">
                  {project.stack.map((s) => (
                    <Badge key={s} variant="outline" className="font-mono text-[11px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </MetaRow>

              {project.last_modified && (
                <div className="flex gap-8">
                  <MetaRow label="Last Modified">
                    <p>{formatRelativeTime(project.last_modified)}</p>
                  </MetaRow>
                  <MetaRow label="Path">
                    <p className="font-mono text-xs text-muted-foreground">{project.path}</p>
                  </MetaRow>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{project.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            {project.description && (
              <MetaRow label="Description">
                <div
                  className="leading-relaxed whitespace-pre-line text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: project.description
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </MetaRow>
            )}

            <div className="grid grid-cols-2 gap-6">
              {project.hosting && (
                <MetaRow label="Hosting">
                  <p>{project.hosting}</p>
                </MetaRow>
              )}
              {project.database && (
                <MetaRow label="Database">
                  <p>{project.database}</p>
                </MetaRow>
              )}
            </div>

            {project.github.repo_url && (
              <MetaRow label="GitHub">
                <div className="space-y-0.5">
                  <p className="font-mono text-xs">
                    {project.github.account}
                    {project.github.ssh_alias && (
                      <span className="text-muted-foreground"> ({project.github.ssh_alias})</span>
                    )}
                  </p>
                  <a
                    href={project.github.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.github.repo_url}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </MetaRow>
            )}

            {project.stack.length > 0 && (
              <MetaRow label="Stack">
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <Badge key={s} variant="outline" className="font-mono text-[11px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </MetaRow>
            )}

            {Object.keys(project.run_commands).length > 0 && (
              <MetaRow label="Run Commands">
                <Card size="sm" className="bg-muted/30">
                  <CardContent className="font-mono text-xs space-y-1.5">
                    {Object.entries(project.run_commands).map(([cmd, desc]) => (
                      <div key={cmd} className="flex gap-4">
                        <span className="shrink-0 font-medium">{cmd}</span>
                        <span className="text-muted-foreground">{desc}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </MetaRow>
            )}

            {project.services.length > 0 && (
              <MetaRow label="Services">
                <div className="flex flex-wrap gap-1.5">
                  {project.services.map((s) => (
                    <Badge key={s} variant="secondary" className="font-mono text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </MetaRow>
            )}

            {project.notes && (
              <MetaRow label="Notes">
                <p className="text-muted-foreground whitespace-pre-line">{project.notes}</p>
              </MetaRow>
            )}

            <div className="flex gap-8 text-xs text-muted-foreground pt-4 border-t">
              <span className="font-mono">{project.path}</span>
              {project.last_modified && (
                <span>Modified {new Date(project.last_modified).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
