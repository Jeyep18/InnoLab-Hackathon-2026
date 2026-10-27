import { ArrowLeft, Bell, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { AccountTab, NotificationsTab, SecurityTab } from '@/components/profile/SettingsTabs'
import { Container } from '@/components/site/layout'
import { replaceRoute, useRoute } from '@/router'
import { useStore } from '@/store'

const SECTIONS = [
  { tab: 'account', label: 'Account', icon: UserRound },
  { tab: 'security', label: 'Password and security', icon: ShieldCheck },
  { tab: 'notifications', label: 'Notifications', icon: Bell },
] as const
type SettingsTab = (typeof SECTIONS)[number]['tab']

/** Private account settings, kept apart from the public profile. */
export function Settings() {
  const { persona } = useStore()
  const { params } = useRoute()
  const requested = params.get('tab')
  const tab: SettingsTab = SECTIONS.some((s) => s.tab === requested) ? (requested as SettingsTab) : 'account'
  return (
    <Container className="max-w-5xl pt-8 pb-16">
      <a href={`#/profile/${persona.id}`} className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        <ArrowLeft className="size-4" /> Back to profile
      </a>
      <h1 className="mt-3 text-[32px] leading-tight font-semibold tracking-tight">Settings</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="md:sticky md:top-20 md:self-start">
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {SECTIONS.map(({ tab: id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => replaceRoute(`/settings?tab=${id}`)}
                  aria-current={tab === id ? 'page' : undefined}
                  className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-secondary aria-[current=page]:text-foreground"
                >
                  <Icon className="size-4 shrink-0" /> {label}
                </button>
              </li>
            ))}
            <li className="md:mt-4 md:border-t md:pt-4">
              <a href="#/signin" className="flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50">
                <LogOut className="size-4" /> Log out
              </a>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">
          {tab === 'account' && <AccountTab />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </Container>
  )
}
