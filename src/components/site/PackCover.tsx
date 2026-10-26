import type { Resource } from '@/domain/types'
import { fileKinds, subjectTone } from '@/lib/pack'
import { cn } from '@/lib/utils'

/** Generated cover: tinted by subject, with grade, title and file types. No image assets needed. */
export function PackCover({ resource, className, size = 'card', variant = 'original' }: { resource: Resource; className?: string; size?: 'card' | 'hero' | 'thumb'; variant?: 'original' | 'paper' }) {
  if (variant === 'paper') return <PaperCover resource={resource} className={className} size={size} />
  return (
    <div
      className={cn(
        'relative isolate flex flex-col justify-end overflow-hidden text-white',
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
            <span key={k} className="rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide ">
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

function PaperCover({ resource, className, size }: { resource: Resource; className?: string; size: 'card' | 'hero' | 'thumb' }) {
  if (size === 'thumb') {
    return (
      <div aria-hidden="true" className={cn('flex aspect-square flex-col justify-between border-l-3 border-sage-700 bg-secondary p-2 text-foreground', className)}>
        <span className="text-[10px] leading-tight">{resource.grade}</span>
        <span className="text-[11px] leading-tight font-medium wrap-anywhere">{resource.subject}</span>
      </div>
    )
  }
  return (
    <div className={cn('library-pack-label flex min-h-52 flex-col border-b bg-secondary/40 p-5 pr-14 text-foreground', className)}>
      <span className="text-xs font-medium tracking-wide uppercase">{resource.grade} / {resource.subject}</span>
      <span className="library-section-title mt-5 line-clamp-3 text-[27px] leading-[1.15]">{resource.title}</span>
      <span className="mt-auto pt-5 text-xs text-muted-foreground">{fileKinds(resource).join(' · ') || 'Lesson pack'} · v{resource.version.label}</span>
    </div>
  )
}
