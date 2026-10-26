import { Link2 } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { bowLabel, currentCurriculumReview, resourceRating } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { initials } from '@/lib/pack'
import { useStore } from '@/store'

/**
 * Copies the pack link and shows how it would read when posted in a teachers' group.
 * The post is a simulated preview: CherIt isn't connected to any social network.
 */
export function ShareLink({ resource, className, label = 'Copy link to share' }: { resource: Resource; className?: string; label?: string }) {
  const { persona, reviews, personaById } = useStore()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<boolean | null>(null)
  const linkId = useId()
  const link = `${window.location.origin}${window.location.pathname}#/resource/${resource.id}`
  const rating = resourceRating(resource, reviews)
  const reviewed = currentCurriculumReview(resource)
  const contributor = personaById(resource.contributorId)?.alias ?? 'a teacher'

  async function share() {
    setOpen(true)
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <Button variant="outline" className={className} onClick={share}>
        <Link2 aria-hidden="true" />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{copied ? 'Link copied' : 'Share this pack'}</DialogTitle>
            <DialogDescription>
              {copied === false
                ? 'Your browser blocked copying. Select the link and copy it yourself.'
                : 'Paste it in your teachers’ group chat or message.'}
            </DialogDescription>
          </DialogHeader>
          <label className="sr-only" htmlFor={linkId}>
            Link to this pack
          </label>
          <Input id={linkId} readOnly value={link} onFocus={(e) => e.target.select()} className="h-10 font-mono text-sm" />

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">How it reads when posted in a teachers’ group (simulated)</p>
            <figure aria-label="Simulated group post preview" className="rounded-xl border bg-card p-3">
              <p className="mb-2.5 flex items-center gap-2 text-sm">
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-secondary text-[11px] font-semibold">
                  {initials(persona)}
                </span>
                <span>
                  <strong className="font-semibold">{persona.alias}</strong> shared a lesson pack
                </span>
              </p>
              <div className="overflow-hidden rounded-lg border bg-secondary/60 p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">CherIt</p>
                <p className="mt-0.5 font-semibold leading-snug">{resource.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resource.grade} {resource.subject}, {bowLabel(resource)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  By {contributor}.{' '}
                  {rating.mean === null
                    ? 'No reviews yet.'
                    : `${rating.mean.toFixed(1)} stars from ${rating.count} teacher rating${rating.count === 1 ? '' : 's'}.`}{' '}
                  {reviewed ? 'Curriculum-reviewed (simulated).' : 'Not yet curriculum-reviewed.'}
                </p>
              </div>
            </figure>
          </div>
          <p className="text-sm text-muted-foreground">
            A preview only. CherIt isn’t connected to Facebook, and this local link opens only on this computer.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
