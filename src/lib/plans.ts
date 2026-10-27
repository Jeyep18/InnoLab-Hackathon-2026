/**
 * Plans shown in the upgrade dialog. Pro is presented only: there is no checkout,
 * no priority queue ordering, no extra storage and no bookmark folders behind it.
 */
export type ProFeature = 'priority-verification' | 'storage' | 'organized-bookmarks'

export type PlanId = 'free' | 'pro'

/** Every demo account is on the free plan. */
export const CURRENT_PLAN: PlanId = 'free'

/** Sample monthly price for the dialog. Not decided by the team. */
export const PRO_PRICE_PHP = 149

/** Upload storage on the free plan, in MB. */
export const FREE_STORAGE_MB = 500

export const PLAN_FEATURES: { id: ProFeature; label: string; free: string; pro: string }[] = [
  { id: 'priority-verification', label: 'Verification', free: 'Free queue', pro: 'Priority queue' },
  { id: 'storage', label: 'Upload storage', free: `${FREE_STORAGE_MB} MB`, pro: '20 GB' },
  { id: 'organized-bookmarks', label: 'Saved packs', free: 'One list', pro: 'Folders and tags' },
]

export const FEATURE_PITCH: Record<ProFeature, { title: string; description: string }> = {
  'priority-verification': {
    title: 'Get verified sooner with Pro',
    description: 'Pro moves your verification request to the front of the verifier’s queue. Standard verification stays free.',
  },
  storage: {
    title: 'More room for your materials with Pro',
    description: 'Pro raises your upload storage so you can share longer slide decks, videos and full-quarter packs.',
  },
  'organized-bookmarks': {
    title: 'Organize your saved packs with Pro',
    description: 'Pro lets you sort saved packs into folders by subject, quarter or class section.',
  },
}
