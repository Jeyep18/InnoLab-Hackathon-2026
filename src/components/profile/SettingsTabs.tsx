import { BadgeCheck, KeyRound, Laptop, Smartphone } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PersonAvatar } from '@/components/site/PersonAvatar'
import { useStore } from '@/store'
import { TabTitle } from './OverviewTab'

export function AccountTab() {
  const { persona, dispatch, notify } = useStore()
  const id = useId()
  const [form, setForm] = useState({ alias: persona.alias, position: persona.position ?? '', school: persona.school ?? '', area: persona.area, bio: persona.bio })
  const [error, setError] = useState('')
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }))
  function save(event: FormEvent) {
    event.preventDefault()
    if (form.alias.trim().length < 3) return setError('Enter the name other teachers will see.')
    setError('')
    dispatch({ type: 'save-profile', edits: Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])) })
    notify('Account details saved.')
  }
  return (
    <form onSubmit={save} className="max-w-2xl space-y-6" noValidate>
      <TabTitle title="Account details" />
      <div className="flex items-center gap-4 rounded-2xl border p-4">
        <PersonAvatar name={form.alias} seed={persona.id} className="size-16" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Profile picture</p>
          <p className="text-sm text-muted-foreground">Generated from your name. Photo upload is coming soon.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-alias`} label="Display name" error={error}><Input id={`${id}-alias`} value={form.alias} onChange={set('alias')} aria-invalid={!!error} /></Field>
        <Field id={`${id}-position`} label="Position"><Input id={`${id}-position`} value={form.position} onChange={set('position')} placeholder="e.g. Teacher III · Grade 4 adviser" /></Field>
        <Field id={`${id}-school`} label="School"><Input id={`${id}-school`} value={form.school} onChange={set('school')} /></Field>
        <Field id={`${id}-area`} label="City or municipality"><Input id={`${id}-area`} value={form.area} onChange={set('area')} /></Field>
      </div>
      <Field id={`${id}-bio`} label="About you"><Textarea id={`${id}-bio`} rows={4} value={form.bio} onChange={set('bio')} /></Field>
      <Field id={`${id}-email`} label="Email">
        <div className="flex items-center gap-2">
          <Input id={`${id}-email`} value={persona.email ?? ''} readOnly className="bg-muted/50" />
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-mauve-ink"><BadgeCheck className="size-4" /> Verified</span>
        </div>
      </Field>
      <div className="flex justify-end border-t pt-5"><Button type="submit">Save changes</Button></div>
    </form>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}

export function SecurityTab() {
  const { notify } = useStore()
  const soon = (what: string) => () => notify(`${what} is coming soon.`)
  return (
    <div className="max-w-2xl space-y-6">
      <TabTitle title="Password and security" />
      <ul className="divide-y rounded-2xl border">
        <Row icon={<KeyRound />} title="Password" detail="Last changed on August 2, 2026" action={<Button variant="outline" onClick={soon('Changing your password')}>Change password</Button>} />
        <Row icon={<Smartphone />} title="Two-step verification" detail="Off. Add a code from your phone when you sign in." action={<Button variant="outline" onClick={soon('Two-step verification')}>Turn on</Button>} />
      </ul>
      <section>
        <h3 className="mb-3 font-semibold">Where you’re signed in</h3>
        <ul className="divide-y rounded-2xl border">
          <Row icon={<Laptop />} title="MacBook · Dia browser" detail="Naga City · Active now" action={<span className="text-sm font-medium text-mauve-ink">This device</span>} />
          <Row icon={<Smartphone />} title="Android phone · Chrome" detail="Naga City · 2 days ago" action={<Button variant="ghost" onClick={soon('Signing out other devices')}>Sign out</Button>} />
        </ul>
      </section>
    </div>
  )
}

function Row({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-4 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary [&_svg]:size-5">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{detail}</span>
      </span>
      {action}
    </li>
  )
}

const NOTIFICATIONS = [
  { id: 'reviews', label: 'Someone reviews one of my packs', on: true },
  { id: 'revisions', label: 'A teacher suggests a revision to my pack', on: true },
  { id: 'sales', label: 'Someone buys one of my bundles', on: true },
  { id: 'adaptations', label: 'A teacher adapts one of my packs', on: true },
  { id: 'digest', label: 'Weekly digest of new packs for my grade and subjects', on: false },
]

export function NotificationsTab() {
  const { notify } = useStore()
  const [settings, setSettings] = useState(() => Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.on])))
  return (
    <div className="max-w-2xl space-y-6">
      <TabTitle title="Notifications" />
      <ul className="divide-y rounded-2xl border">
        {NOTIFICATIONS.map((n) => (
          <li key={n.id} className="flex items-center gap-3 p-4">
            <Checkbox id={`notify-${n.id}`} checked={settings[n.id]} onCheckedChange={(value) => setSettings((current) => ({ ...current, [n.id]: value === true }))} />
            <label htmlFor={`notify-${n.id}`} className="flex-1 cursor-pointer">{n.label}</label>
          </li>
        ))}
      </ul>
      <div className="flex justify-end"><Button onClick={() => notify('Notification settings saved.')}>Save</Button></div>
    </div>
  )
}
