import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Numbered progress for the share wizard. Earlier steps can be revisited; later ones unlock through "Next". */
export function Stepper({ steps, current, onSelect }: { steps: readonly string[]; current: number; onSelect: (index: number) => void }) {
  return (
    <nav aria-label="Share steps">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          const marker = (
            <span
              aria-hidden="true"
              className={cn(
                'grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold tabular-nums transition-colors duration-200',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary bg-card text-mauve-ink ring-3 ring-primary/20',
                !done && !active && 'border-border bg-card text-muted-foreground',
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </span>
          )
          const text = (
            <span className={cn('text-sm font-medium', active ? 'text-foreground' : 'text-muted-foreground', !active && 'max-sm:sr-only')}>
              <span className="sr-only">
                Step {i + 1} of {steps.length}:{' '}
              </span>
              {label}
              {done && <span className="sr-only"> (complete)</span>}
            </span>
          )
          return (
            <li key={label} aria-current={active ? 'step' : undefined} className={cn('flex min-w-0 items-center gap-2 sm:gap-3', i < steps.length - 1 && 'flex-1')}>
              {done ? (
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  className="-m-1 flex min-h-10 items-center gap-2 rounded-lg p-1 outline-none hover:[&>span:last-child]:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {marker}
                  {text}
                </button>
              ) : (
                <span className="flex min-h-10 items-center gap-2">
                  {marker}
                  {text}
                </span>
              )}
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="h-0.5 min-w-4 flex-1 overflow-hidden rounded-full bg-border">
                  <span className={cn('block h-full origin-left bg-primary transition-transform duration-200 ease-out', done ? 'scale-x-100' : 'scale-x-0')} />
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
