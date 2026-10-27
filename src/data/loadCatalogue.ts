import seed from './catalogue.json'
import type { Catalogue } from '../domain/types'
import { packsFromManifest, type PackManifest } from './folderPacks'

export const seedCatalogue = seed as Catalogue

/**
 * Adds folder-based packs listed by the local server: fictional placeholders from
 * sample-packs/ and, when present on this computer, the teachers' demonstration-only
 * files from demo-assets/packs/. Without the server (or the folders), only the seed loads.
 */
export async function loadCatalogue(): Promise<{ catalogue: Catalogue; teacherPackCount: number }> {
  try {
    const response = await fetch('/packs-manifest.json', { cache: 'no-store' })
    if (!response.ok || !response.headers.get('content-type')?.includes('json')) throw new Error('No manifest')
    const manifest = (await response.json()) as PackManifest
    const folder = packsFromManifest(manifest, seedCatalogue.personas)
    return {
      catalogue: {
        personas: [...seedCatalogue.personas, ...folder.personas],
        resources: [...seedCatalogue.resources, ...folder.resources],
        seedReviews: [...seedCatalogue.seedReviews, ...folder.reviews],
        seedSales: seedCatalogue.seedSales,
      },
      teacherPackCount: manifest.packs.filter((p) => p.source === 'teacher').length,
    }
  } catch {
    return { catalogue: seedCatalogue, teacherPackCount: 0 }
  }
}
