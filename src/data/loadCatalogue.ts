import seed from './catalogue.json'
import type { Catalogue, Persona, Resource } from '../domain/types'

export const seedCatalogue = seed as Catalogue

/**
 * Optional demonstration-only teacher files. When demo-assets/catalogue.json exists on
 * this machine, the local dev server serves it; it is never bundled or committed.
 */
export async function loadCatalogue(): Promise<{ catalogue: Catalogue; localCount: number }> {
  try {
    const response = await fetch('/demo-assets/catalogue.json', { cache: 'no-store' })
    if (!response.ok) return { catalogue: seedCatalogue, localCount: 0 }
    const local = (await response.json()) as { personas?: Persona[]; resources?: Resource[] }
    const resources = (local.resources ?? []).map((r) => ({
      ...r,
      permission: {
        kind: 'demo-only-teacher-file' as const,
        notice:
          r.permission?.notice ??
          'Shared by an interviewed teacher for this demonstration only. Not for redistribution, sale or public posting.',
      },
    }))
    return {
      catalogue: {
        personas: [...seedCatalogue.personas, ...(local.personas ?? [])],
        resources: [...seedCatalogue.resources, ...resources],
        seedReviews: seedCatalogue.seedReviews,
      },
      localCount: resources.length,
    }
  } catch {
    return { catalogue: seedCatalogue, localCount: 0 }
  }
}
