import { ArrowRight } from 'lucide-react'
import { PersonAvatar } from '@/components/site/PersonAvatar'
import { Container, Logo } from '@/components/site/layout'
import { navigate } from '@/router'
import { useStore } from '@/store'

/** Shown after logging out: pick the account to continue with. */
export function SignIn() {
  const { catalogue, personaById, dispatch, notify } = useStore()
  const accounts = catalogue.personas.filter((p) => p.listed !== false).map((p) => personaById(p.id)!)
  return (
    <Container className="grid max-w-md place-items-center pt-14 pb-20">
      <div className="w-full rounded-3xl border bg-card p-6 sm:p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">You’re signed out</h1>
        <p className="mt-1 text-muted-foreground">Choose an account to continue.</p>
        <ul className="mt-6 space-y-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'select-persona', personaId: account.id })
                  notify(`Welcome back, ${account.alias}.`)
                  navigate('/')
                }}
                className="group flex w-full items-center gap-3 rounded-2xl border p-3 text-left outline-none transition-colors hover:border-primary/50 hover:bg-secondary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <PersonAvatar name={account.alias} seed={account.id} className="size-10" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{account.alias}</span>
                  <span className="block truncate text-sm text-muted-foreground">{account.school ?? account.area}</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}
