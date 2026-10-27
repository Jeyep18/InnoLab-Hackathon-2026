import { Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/site/layout'
import { PLATFORM_FEE } from '@/domain/logic'
import { useStore } from '@/store'
import { peso, TabTitle } from './OverviewTab'
import type { ProfileModel } from './useProfile'

const monthLabel = (month: string) => new Date(`${month}-01T00:00:00`).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })
const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })

export function EarningsTab({ model }: { model: ProfileModel }) {
  const { notify } = useStore()
  const { earnings, published } = model
  const paidPacks = published.filter((resource) => resource.supplementBundle)
  const thisMonth = earnings.byMonth.at(-1)?.net ?? 0
  const max = Math.max(1, ...earnings.byMonth.map((row) => row.net))
  const fee = `${Math.round(PLATFORM_FEE * 100)}%`
  if (!paidPacks.length) {
    return (
      <>
        <TabTitle title="Earnings" />
        <EmptyState title="No paid bundles yet" actions={<Button render={<a href="#/share" />} nativeButton={false}>Share a lesson</Button>}>
          Lesson plans are always free. Add optional worksheets, slides or quizzes as a paid bundle when you share a lesson.
        </EmptyState>
      </>
    )
  }
  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 border-y sm:grid-cols-4 sm:divide-x">
        <Card label="total earned" value={peso(earnings.net)} />
        <Card label="this month" value={peso(thisMonth)} />
        <Card label={earnings.sales.length === 1 ? 'sale' : 'sales'} value={String(earnings.sales.length)} />
        <Card label={`CherIt fee (${fee})`} value={peso(earnings.fee)} />
      </dl>
      <section>
        <TabTitle title="By month" />
        <div className="mt-4 flex h-40 items-end gap-4" role="img" aria-label={earnings.byMonth.map((row) => `${monthLabel(row.month)}: ${peso(row.net)}`).join(', ')}>
          {earnings.byMonth.map((row) => (
            <div key={row.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-xs font-medium tabular-nums">{peso(row.net)}</span>
              <span className="w-full max-w-16 rounded-t-lg bg-primary" style={{ height: `${Math.max(4, (row.net / max) * 100)}%` }} />
              <span className="text-xs text-muted-foreground">{monthLabel(row.month)}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <TabTitle title="Recent sales" />
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-muted-foreground">
              <tr><th className="px-4 py-2.5 font-medium">Date</th><th className="px-4 py-2.5 font-medium">Bundle</th><th className="px-4 py-2.5 font-medium">Buyer</th><th className="px-4 py-2.5 text-right font-medium">You earn</th></tr>
            </thead>
            <tbody className="divide-y">
              {earnings.sales.slice(0, 12).map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(sale.date)}</td>
                  <td className="max-w-56 truncate px-4 py-2.5 font-medium">{sale.title}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{sale.buyerLabel}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{peso(sale.amountPhp * (1 - PLATFORM_FEE))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="flex flex-wrap items-center gap-4 rounded-2xl border p-5">
        <span className="grid size-10 place-items-center rounded-xl bg-secondary"><Smartphone className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">GCash · 0917 ••• 4567</p>
          <p className="text-sm text-muted-foreground">Paid out on the 15th</p>
        </div>
        <Button variant="outline" onClick={() => notify('Payout method changes are coming soon.')}>Change</Button>
      </section>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-1 py-4 pr-4 sm:px-6 sm:first:pl-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-[28px] leading-none font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
