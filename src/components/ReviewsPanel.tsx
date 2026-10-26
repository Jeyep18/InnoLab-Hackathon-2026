import { ChevronDown, MessageSquareText, PencilLine } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RatingLine, Stars } from '@/components/site/Rating'
import { currentReviews, DemoRuleError, olderReviews, personaReview, resourceRating, reviewEligibility } from '@/domain/logic'
import type { Resource, Review } from '@/domain/types'
import { initials } from '@/lib/pack'
import { useStore } from '@/store'
import { StarRatingInput } from './detail/StarRatingInput'

/** Sidebar entry point: the rating row opens every review and the review form in a dialog. */
export function ReviewsDialog({ resource }: { resource: Resource }) {
  const { state, reviews, persona } = useStore()
  const count = currentReviews(resource, reviews).length
  const canReview = reviewEligibility(state, resource, persona.role) === 'ok'
  if (count === 0 && !canReview) return null
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" size="sm" className="h-auto px-0 text-mauve-ink" />}>
        <MessageSquareText aria-hidden="true" />
        {count > 0 ? `Read ${count} review${count === 1 ? '' : 's'}${canReview ? ' or rate it' : ''}` : 'Rate this pack'}
      </DialogTrigger>
      <DialogContent className="flex max-h-[88dvh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-4 pr-12">
          <DialogTitle>Ratings and feedback</DialogTitle>
          <DialogDescription className="sr-only">Teacher reviews for this version of the pack.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
          <ReviewsPanel resource={resource} embedded />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ReviewsPanel({ resource, embedded = false }: { resource: Resource; embedded?: boolean }) {
  const { state, reviews, persona } = useStore()
  const current = currentReviews(resource, reviews)
  const older = olderReviews(resource, reviews)
  const summary = resourceRating(resource, reviews)
  const eligibility = reviewEligibility(state, resource, persona.role)

  const hint =
    eligibility === 'own-resource'
        ? 'You shared this pack, so you can’t rate it.'
        : eligibility === 'moderator'
          ? 'The demo moderator doesn’t rate packs. Switch to a teacher persona.'
          : null

  return (
    <section aria-labelledby={embedded ? undefined : 'reviews-title'} aria-label={embedded ? 'Reviews' : undefined} className="scroll-mt-24">
      {!embedded && (
        <h2 id="reviews-title" className="library-section-title text-2xl">
          Ratings and feedback
        </h2>
      )}

      <div className={`${embedded ? '' : 'mt-4 '}flex flex-col gap-4 border-b py-5 sm:flex-row sm:items-center sm:justify-between ${embedded ? '' : 'border-t'}`}>
        <div className="space-y-1">
          <RatingLine summary={summary} className="text-base" />
          <p className="text-sm text-muted-foreground">For version {resource.version.label}. Earlier versions are listed separately.</p>
        </div>
        {eligibility === 'ok' && <ReviewFormDialog resource={resource} />}
      </div>

      {hint && <p className="mt-3 text-sm text-muted-foreground">{hint}</p>}

      {current.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No reviews yet for this version.</p>
      ) : (
        <ul className="mt-6 divide-y">
          {current.map((r) => (
            <ReviewItem key={r.id} review={r} mine={r.personaId === persona.id} />
          ))}
        </ul>
      )}

      {older.length > 0 && (
        <details className="group mt-6 border-y">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium outline-none hover:text-mauve-ink focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
            {older.length} review{older.length === 1 ? '' : 's'} of earlier versions (not counted in the rating)
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <ul className="divide-y">
            {older.map((r) => (
              <ReviewItem key={r.id} review={r} mine={r.personaId === persona.id} />
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

function ReviewItem({ review, mine }: { review: Review; mine: boolean }) {
  const { personaById } = useStore()
  return (
    <li className="py-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold">
          {initials(personaById(review.personaId))}
        </span>
        <span className="flex min-w-0 flex-col">
          <strong className="truncate font-semibold">{review.authorLabel}</strong>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span role="img" aria-label={`${review.rating} out of 5`}>
              <Stars value={review.rating} />
            </span>
            <span>Version {review.resourceVersion}</span>
          </span>
        </span>
        <span className="flex flex-wrap gap-1.5 sm:ml-auto">
          {review.seeded && (
            <Badge variant="secondary" className="text-muted-foreground">
              Sample review
            </Badge>
          )}
          {mine && <Badge>Your review</Badge>}
        </span>
      </div>
      {review.text && <p className="mt-3 text-pretty">{review.text}</p>}
      {review.usedInClass && <p className="mt-2 text-sm text-muted-foreground">Says they used it in class (self-reported).</p>}
    </li>
  )
}

function ReviewFormDialog({ resource }: { resource: Resource }) {
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const existing = personaReview(state, resource.id)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={existing ? 'outline' : 'default'} />}>
          {existing ? <PencilLine aria-hidden="true" /> : <MessageSquareText aria-hidden="true" />}
          {existing ? 'Edit your review' : 'Rate this pack'}
        </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {/* Content unmounts on close, so reopening starts from the saved review. */}
        <ReviewForm resource={resource} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ReviewForm({ resource, onDone }: { resource: Resource; onDone: () => void }) {
  const { state, persona, dispatch, notify } = useStore()
  const existing = personaReview(state, resource.id)
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [text, setText] = useState(existing?.text ?? '')
  const [usedInClass, setUsedInClass] = useState(existing?.usedInClass ?? false)
  const [error, setError] = useState('')
  const ids = { text: useId(), used: useId(), error: useId() }

  // Switching persona swaps whose review is being edited.
  useEffect(() => {
    setRating(existing?.rating ?? 0)
    setText(existing?.text ?? '')
    setUsedInClass(existing?.usedInClass ?? false)
    setError('')
  }, [existing?.id, existing?.rating, existing?.text, existing?.usedInClass, persona.id])

  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      dispatch({
        type: 'save-review',
        resource,
        role: persona.role,
        authorLabel: `${persona.alias} (demo persona)`,
        rating,
        text,
        usedInClass,
        at: new Date().toISOString(),
      })
      setError('')
      notify(existing ? 'Review updated. Ratings recalculated.' : 'Review posted. Ratings recalculated.')
      onDone()
    } catch (e) {
      setError(e instanceof DemoRuleError ? e.message : 'The review couldn’t be saved.')
    }
  }

  const olderVersion = existing && existing.resourceVersion !== resource.version.label

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">{existing ? 'Edit your review' : `Rate this pack as ${persona.alias}`}</DialogTitle>
        <DialogDescription>Your rating counts toward version {resource.version.label} only.</DialogDescription>
      </DialogHeader>
      {olderVersion && (
        <p className="rounded-lg bg-secondary px-3 py-2 text-sm">
          Your earlier review was for version {existing.resourceVersion}. Saving replaces it with a review of version{' '}
          {resource.version.label}.
        </p>
      )}
      <StarRatingInput value={rating} onChange={setRating} describedBy={error ? ids.error : undefined} invalid={!!error && rating === 0} />
      <div className="grid gap-1.5">
        <Label htmlFor={ids.text}>What worked or what would you change? (optional)</Label>
        <Textarea id={ids.text} rows={3} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} className="text-base" />
      </div>
      <div className="flex min-h-10 items-center gap-3">
        <Checkbox id={ids.used} checked={usedInClass} onCheckedChange={(v) => setUsedInClass(v === true)} />
        <Label htmlFor={ids.used} className="font-normal">
          I used this in class
        </Label>
      </div>
      {error && (
        <p id={ids.error} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
        <Button type="submit">{existing ? 'Update review' : 'Post review'}</Button>
      </DialogFooter>
    </form>
  )
}
