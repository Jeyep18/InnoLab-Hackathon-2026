import { AlertTriangle, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export interface ErrorItem {
  /** Element to focus when the teacher picks this problem. */
  target: string
  message: string
}

/**
 * A floating card listing what blocks the current step. Sits above the sticky action bar so it
 * can't be missed, and each item jumps to its field. Inline messages stay next to the fields.
 */
export function ErrorCard({ items, onSelect }: { items: ErrorItem[]; onSelect: (target: string) => void }) {
  const reduceMotion = useReducedMotion()
  const [dismissed, setDismissed] = useState(false)
  const signature = items.map((item) => item.message).join('|')
  useEffect(() => setDismissed(false), [signature])
  const show = items.length > 0 && !dismissed

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          aria-labelledby="share-error-title"
          initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] } }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 8, transition: { duration: 0.12, ease: 'easeIn' } }}
          className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-2xl border border-destructive/40 bg-card p-4 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)] ring-4 ring-destructive/10 sm:bottom-6"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p id="share-error-title" className="font-semibold">
                {items.length === 1 ? 'Fix 1 thing to continue' : `Fix ${items.length} things to continue`}
              </p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {items.map((item) => (
                  <li key={item.target + item.message}>
                    <button
                      type="button"
                      onClick={() => onSelect(item.target)}
                      className="text-left text-sm text-destructive underline-offset-2 outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {item.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <Button type="button" variant="ghost" size="icon" className="-mt-1 -mr-1 size-8 shrink-0" onClick={() => setDismissed(true)} aria-label="Dismiss">
              <X />
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
