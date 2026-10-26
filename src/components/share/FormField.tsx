import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Label, optional hint, control and inline error. Error ids follow `${id}-error` for aria-describedby. */
export function FormField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  optional?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id} className="text-[15px]">
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {children}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null
  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {children}
    </p>
  )
}

/** Builds aria-describedby from the hint and error ids that are actually rendered. */
export function describedBy(id: string, { hint, error }: { hint?: boolean; error?: string }) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
}
