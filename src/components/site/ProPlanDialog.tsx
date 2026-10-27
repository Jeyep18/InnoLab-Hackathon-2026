import { Check, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FEATURE_PITCH, PLAN_FEATURES, PRO_PRICE_PHP, type ProFeature } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

/**
 * Compares the free plan with Pro when a teacher reaches for a Pro feature.
 * Display only: upgrading isn't implemented and nothing is charged.
 */
export function ProPlanDialog({ feature, open, onOpenChange }: { feature?: ProFeature; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { notify } = useStore()
  const pitch = feature ? FEATURE_PITCH[feature] : { title: 'Upgrade to CherIt Pro', description: 'Pro adds priority verification, more storage and organized saved packs.' }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-xl sm:p-6">
        <DialogHeader>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-mauve-ink uppercase">
            <Sparkles aria-hidden="true" className="size-3.5" /> CherIt Pro
          </p>
          <DialogTitle className="text-xl font-semibold text-balance">{pitch.title}</DialogTitle>
          <DialogDescription className="text-pretty">{pitch.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <PlanCard name="Free" price="₱0" current features={PLAN_FEATURES.map((f) => ({ id: f.id, label: f.label, text: f.free }))} highlight={feature} />
          <PlanCard name="Pro" price={`₱${PRO_PRICE_PHP}`} features={PLAN_FEATURES.map((f) => ({ id: f.id, label: f.label, text: f.pro }))} highlight={feature} pro />
        </div>

        <p className="text-xs text-muted-foreground">Sample pricing. Pro isn’t available in this demo, and nothing is charged.</p>

        {/* Match the footer's bleed to this dialog's larger sm:p-6 padding. */}
        <DialogFooter className="sm:-mx-6 sm:-mb-6 sm:px-6">
          <DialogClose render={<Button type="button" variant="outline" />}>Stay on Free</DialogClose>
          <Button
            type="button"
            onClick={() => {
              notify('Pro checkout isn’t part of this demo. You’re still on the free plan.')
              onOpenChange(false)
            }}
          >
            <Sparkles aria-hidden="true" /> Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PlanCard({ name, price, features, highlight, current = false, pro = false }: {
  name: string
  price: string
  features: { id: ProFeature; label: string; text: string }[]
  highlight?: ProFeature
  current?: boolean
  pro?: boolean
}) {
  return (
    <section aria-label={`${name} plan`} className={cn('rounded-xl border p-4', pro ? 'border-primary/50 bg-secondary/60' : 'bg-card')}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{name}</h3>
        {current && <Badge variant="outline">Current plan</Badge>}
      </div>
      <p className="mt-1">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{price}</span>
        <span className="text-sm text-muted-foreground"> / month</span>
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f.id} className={cn('flex items-start gap-2', f.id === highlight && pro && 'font-medium text-foreground')}>
            <Check aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', pro ? 'text-primary' : 'text-muted-foreground')} />
            <span>
              <span className="block text-xs text-muted-foreground">{f.label}</span>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
