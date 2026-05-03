'use client'

import { formatRelativeTime } from '@/lib/format'
import type { Project } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useState } from 'react'

const GRADIENTS = [
  'from-blue-500/20 to-purple-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-orange-500/20 to-rose-500/20',
  'from-violet-500/20 to-indigo-500/20',
  'from-cyan-500/20 to-blue-500/20',
  'from-pink-500/20 to-red-500/20',
  'from-amber-500/20 to-yellow-500/20',
  'from-lime-500/20 to-green-500/20',
]

function hashIndex(name: string, len: number): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return Math.abs(h) % len
}

function ProjectPreview({ name }: { name: string }) {
  const gradient = GRADIENTS[hashIndex(name, GRADIENTS.length)]
  return (
    <div className={`w-full aspect-[4/3] rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <span className="text-2xl font-medium text-[var(--foreground)] opacity-30">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function ProjectDetailContent({ project }: { project: Project }) {
  return (
    <div className="space-y-5 text-sm">
      {project.description && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Description</p>
          <div
            className="leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: project.description
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br />')
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {project.hosting && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Hosting</p>
            <p>{project.hosting}</p>
          </div>
        )}
        {project.database && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Database</p>
            <p>{project.database}</p>
          </div>
        )}
      </div>

      {project.github.repo_url && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">GitHub</p>
          <p className="font-mono text-xs">
            {project.github.account && <span>{project.github.account}</span>}
            {project.github.ssh_alias && <span className="text-muted-foreground"> ({project.github.ssh_alias})</span>}
          </p>
          <a
            href={project.github.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {project.github.repo_url}
          </a>
        </div>
      )}

      {Object.keys(project.run_commands).length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Run Commands</p>
          <div className="bg-muted/50 rounded-lg px-3 py-2 font-mono text-xs space-y-1">
            {Object.entries(project.run_commands).map(([cmd, desc]) => (
              <div key={cmd} className="flex gap-4">
                <span className="shrink-0">{cmd}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.services.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Services</p>
          <div className="flex flex-wrap gap-1.5">
            {project.services.map((s) => (
              <Badge key={s} variant="secondary" className="font-mono text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {project.stack.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <Badge key={s} variant="outline" className="font-mono text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {project.notes && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Notes</p>
          <p className="text-muted-foreground whitespace-pre-line">{project.notes}</p>
        </div>
      )}

      <div className="flex gap-6 text-xs text-muted-foreground pt-3 border-t">
        <span className="font-mono">{project.path}</span>
        {project.last_modified && (
          <span>Modified: {new Date(project.last_modified).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={() => setOpen(true)}
      >
        <CardContent className="flex gap-4">
          <div className="w-[120px] shrink-0">
            <ProjectPreview name={project.name} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium truncate">{project.name}</h3>
              {project.last_modified && (
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatRelativeTime(project.last_modified)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {project.description_short}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {project.stack.slice(0, 4).map((s) => (
                <Badge key={s} variant="outline" className="font-mono text-[11px] py-0">
                  {s}
                </Badge>
              ))}
              {project.stack.length > 4 && (
                <span className="text-[11px] text-muted-foreground">+{project.stack.length - 4}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{project.name}</DialogTitle>
            <DialogDescription>{project.description_short}</DialogDescription>
          </DialogHeader>
          <ProjectDetailContent project={project} />
        </DialogContent>
      </Dialog>
    </>
  )
}
