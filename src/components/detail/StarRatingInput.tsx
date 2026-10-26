import { Star } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/** Five native radios styled as stars: arrow keys move the rating, Tab leaves the group. */
export function StarRatingInput({
  value,
  onChange,
  describedBy,
  invalid,
}: {
  value: number
  onChange: (value: number) => void
  describedBy?: string
  invalid?: boolean
}) {
  const name = useId()
  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="mb-1.5 text-sm font-medium">Rating</legend>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="grid size-10 cursor-pointer place-items-center rounded-lg transition-colors hover:bg-secondary has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              aria-invalid={invalid || undefined}
              className="sr-only"
            />
            <Star
              aria-hidden="true"
              className={cn('size-7 transition-colors', n <= value ? 'fill-star text-star' : 'fill-transparent text-muted-foreground/60')}
            />
            <span className="sr-only">
              {n} star{n === 1 ? '' : 's'}
            </span>
          </label>
        ))}
        <span className="ml-2 text-sm text-muted-foreground tabular-nums" aria-hidden="true">
          {value > 0 ? `${value} of 5` : 'Not rated'}
        </span>
      </div>
    </fieldset>
  )
}
