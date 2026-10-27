import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Resource } from '@/domain/types'
import { navigate } from '@/router'
import { useStore } from '@/store'

export function ReportDialog({ resource, open, onClose }: { resource: Resource; open: boolean; onClose: () => void }) {
  const { dispatch, notify } = useStore()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const fieldId = useId()
  const errorId = useId()

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Report a problem with this pack</DialogTitle>
          <DialogDescription>The pack is hidden from search until a verifier checks it.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor={fieldId}>What’s wrong?</Label>
          <Textarea
            id={fieldId}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. contains a learner’s name, copied without permission, wrong grade"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="text-base"
          />
          {error && (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!reason.trim()) return setError('Describe the problem so the verifier can check it.')
              dispatch({ type: 'set-status', resourceId: resource.id, status: 'held', holdReason: reason.trim() })
              setReason('')
              setError('')
              onClose()
              notify('Reported. The pack is hidden until a verifier checks it.')
              navigate('/')
            }}
          >
            Report and hold
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
