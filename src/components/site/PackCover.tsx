import type { Resource } from '@/domain/types'
import { fileKinds, subjectTone } from '@/lib/pack'
import { cn } from '@/lib/utils'

/** Generated cover: tinted by subject, with grade, title and file types. No image assets needed. */
export function PackCover({ resource, className, size = 'card' }: { resource: Resource; className?: string; size?: 'card' | 'hero' | 'thumb' }) {
  return (
    <div
      className={cn(
        'relative isolate flex flex-col justify-end overflow-hidden bg-linear-to-b text-white',
        subjectTone(resource.subject),
        size === 'thumb' ? 'aspect-square rounded-lg p-2.5' : 'aspect-[16/10] p-4',
        size === 'hero' && 'aspect-[16/8] p-6',
        className,
      )}
    >
      {/* Decorative ring, the same mark on every cover. */}
      <span aria-hidden="true" className="absolute -top-10 -right-10 -z-10 size-40 rounded-full border-[22px] border-white/10" />
      {size !== 'thumb' && (
        <span aria-hidden="true" className="absolute top-3.5 left-4 flex flex-wrap gap-1.5">
          {fileKinds(resource).map((k) => (
            <span key={k} className="rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm">
              {k}
            </span>
          ))}
        </span>
      )}
      <span className={cn('font-semibold tracking-wider uppercase opacity-90', size === 'thumb' ? 'text-[10px]' : 'text-xs')}>
        {resource.grade} · {resource.subject}
      </span>
      <span
        className={cn(
          'mt-1 font-bold tracking-tight text-balance',
          size === 'thumb' ? 'line-clamp-3 text-[13px] leading-tight' : size === 'hero' ? 'text-3xl leading-tight' : 'line-clamp-2 text-xl leading-snug',
        )}
      >
        {resource.title}
      </span>
    </div>
  )
}
