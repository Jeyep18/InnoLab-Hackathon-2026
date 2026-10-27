import { createElement, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react'

type RevealTag = 'div' | 'section' | 'header' | 'p' | 'h1' | 'h2' | 'ul' | 'ol'

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag
  /** Milliseconds to wait after the element enters the viewport. */
  delay?: number
  /** Animate the direct children one after another instead of the element itself. */
  stagger?: boolean
  /** Also animate when already on screen at mount (a one-time intro). Otherwise on-screen content just appears. */
  intro?: boolean
}

/**
 * Fades content up once as it scrolls into view. Never replays on scroll-up.
 * Content stays visible without JS or IntersectionObserver: the hidden state is only
 * applied here, before first paint, and only to content that is going to animate.
 * Styles live in index.css under `[data-reveal]`.
 */
export function Reveal({ as = 'div', delay, stagger, intro, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || el.dataset.reveal === 'shown' || typeof IntersectionObserver === 'undefined') return
    const onScreen = el.getBoundingClientRect().top < window.innerHeight * 0.9
    if (onScreen && !intro) return
    el.dataset.reveal = 'hidden'
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        el.dataset.reveal = 'shown'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      // Start clean if the effect re-runs (StrictMode) before the reveal fired.
      if (el.dataset.reveal === 'hidden') delete el.dataset.reveal
    }
    // Decided once at mount: later prop changes must not replay the entrance.
  }, [])

  return createElement(as, {
    ...rest,
    ref,
    'data-reveal-stagger': stagger ? '' : undefined,
    style: delay ? ({ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties) : style,
  })
}
