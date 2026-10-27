import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProPlanDialog } from '@/components/site/ProPlanDialog'
import { useStore } from '@/store'
import { FREE_STORAGE_MB } from '@/lib/plans'

const FREE_STORAGE_BYTES = FREE_STORAGE_MB * 1024 * 1024

/** Free-plan storage used by this teacher's shared packs plus the files picked now. Display only. */
export function StorageMeter({ pickedBytes }: { pickedBytes: number }) {
  const { state, persona } = useStore()
  const [proOpen, setProOpen] = useState(false)
  const sharedBytes = state.contributions
    .filter((r) => r.contributorId === persona.id)
    .reduce((sum, r) => sum + r.files.reduce((s, f) => s + (f.sizeBytes ?? 0), 0), 0)
  const used = sharedBytes + pickedBytes
  const mb = (bytes: number) => Math.round((bytes / (1024 * 1024)) * 10) / 10
  const label = `${mb(used)} MB of ${mb(FREE_STORAGE_BYTES)} MB used`

  return (
    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-medium text-foreground">Free plan</span>
        <span className="tabular-nums">{label}</span>
        <Button type="button" variant="link" size="sm" className="ml-auto h-auto px-0 text-xs after:-inset-x-1 after:-inset-y-3" onClick={() => setProOpen(true)}>
          <Sparkles aria-hidden="true" /> Get more storage
        </Button>
      </div>
      <Progress value={Math.min(100, (used / FREE_STORAGE_BYTES) * 100)} aria-label={`Upload storage: ${label}`} />
      <ProPlanDialog feature="storage" open={proOpen} onOpenChange={setProOpen} />
    </div>
  )
}
