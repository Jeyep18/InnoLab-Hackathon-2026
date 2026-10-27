import { cn } from '@/lib/utils'

const BACKGROUNDS = ['#dfe8e1', '#e8e1d6', '#dde4ee', '#efe0dc', '#e4e0ee', '#e2ebe9']
const SKIN = ['#f1c9a5', '#e0ac85', '#c98e66', '#a8714c', '#8a5a3c']
const HAIR = ['#1f1a17', '#2f2420', '#3e2c22', '#4a3427']
const SHIRTS = ['#4f6b5c', '#3f5568', '#7a5a46', '#5c4f72', '#3d5f5a', '#6b4f4f']

function hash(text: string): number {
  let h = 2166136261
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619)
  return Math.abs(h)
}

/**
 * Illustrated portrait generated from a name, so every teacher and reviewer has a recognisable
 * picture without uploading a photo. "Ma'am" names get longer hairstyles, "Sir" names shorter ones.
 */
export function PersonAvatar({ name, seed = name, className, title }: { name: string; seed?: string; className?: string; title?: string }) {
  const h = hash(seed)
  const pick = <T,>(list: T[], shift: number) => list[(h >> shift) % list.length]
  const masculine = /^sir\b/i.test(name.trim())
  const style = masculine ? (h >> 3) % 2 : 2 + ((h >> 3) % 3)
  const hair = pick(HAIR, 5)
  const skin = pick(SKIN, 7)
  const glasses = (h >> 11) % 4 === 0
  return (
    <svg viewBox="0 0 64 64" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} className={cn('shrink-0 rounded-full', className)}>
      <rect width="64" height="64" fill={pick(BACKGROUNDS, 1)} />
      {style === 3 && <path d="M15 34c0-15 7-24 17-24s17 9 17 24v18H15z" fill={hair} />}
      {style === 4 && <circle cx="32" cy="12" r="7" fill={hair} />}
      <path d="M10 64c2-12 11-18 22-18s20 6 22 18z" fill={pick(SHIRTS, 9)} />
      <rect x="27" y="36" width="10" height="11" rx="4" fill={skin} />
      <ellipse cx="32" cy="29" rx="11" ry="12.5" fill={skin} />
      {style === 0 && <path d="M21 27c0-9 5-14 11-14s11 5 11 14c-3-5-7-7-11-7s-8 2-11 7z" fill={hair} />}
      {style === 1 && <path d="M20 28c-1-10 5-16 12-16s14 5 12 16c-2-6-5-8-6-8-3 3-9 4-15 3-1 1-2 3-3 5z" fill={hair} />}
      {style >= 2 && <path d="M20 31c-2-12 4-19 12-19s14 7 12 19c-2-7-6-11-12-11s-10 4-12 11z" fill={hair} />}
      {style === 2 && <path d="M20 30c0 8 1 14 3 18h-6c-1-6 0-13 3-18zm24 0c0 8-1 14-3 18h6c1-6 0-13-3-18z" fill={hair} />}
      <circle cx="27.5" cy="30" r="1.3" fill="#2a211c" />
      <circle cx="36.5" cy="30" r="1.3" fill="#2a211c" />
      <path d="M28.5 35.5c2 1.6 5 1.6 7 0" stroke="#7a4a3a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {glasses && (
        <g stroke="#2a211c" strokeWidth="1.1" fill="none">
          <circle cx="27.5" cy="30" r="3.6" />
          <circle cx="36.5" cy="30" r="3.6" />
          <path d="M31.1 30h1.8" />
        </g>
      )}
    </svg>
  )
}
