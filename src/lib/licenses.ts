/**
 * Licenses a contributor can choose for their free lesson plan. CherIt never picks one for them:
 * the contributor declares it, the same way a repository owner picks a license on GitHub.
 * Paid supplements always use PAID_SUPPLEMENT_TERMS so buyers can't re-share what they paid for.
 */
export type LicenseId = 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'cc-by-nc-sa' | 'all-rights-reserved'

export interface License {
  id: LicenseId
  name: string
  short: string
  summary: string
  /** What other teachers may do. */
  permissions: string[]
  /** What they must do when they use it. */
  conditions: string[]
  /** What they may not do. */
  limitations: string[]
  url?: string
}

export const LICENSES: License[] = [
  {
    id: 'cc-by-nc-sa',
    name: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0',
    short: 'CC BY-NC-SA',
    summary: 'Teachers can adapt and re-share it for free, with credit, under the same license.',
    permissions: ['Use in class', 'Adapt', 'Share copies'],
    conditions: ['Credit you', 'Keep the same license on adaptations'],
    limitations: ['No selling'],
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  {
    id: 'cc-by-nc',
    name: 'Creative Commons Attribution-NonCommercial 4.0',
    short: 'CC BY-NC',
    summary: 'Teachers can adapt and re-share it for free, with credit.',
    permissions: ['Use in class', 'Adapt', 'Share copies'],
    conditions: ['Credit you'],
    limitations: ['No selling'],
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
  },
  {
    id: 'cc-by-sa',
    name: 'Creative Commons Attribution-ShareAlike 4.0',
    short: 'CC BY-SA',
    summary: 'Anyone can adapt, re-share or sell it, with credit, under the same license.',
    permissions: ['Use in class', 'Adapt', 'Share copies', 'Sell or use commercially'],
    conditions: ['Credit you', 'Keep the same license on adaptations'],
    limitations: [],
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    id: 'cc-by',
    name: 'Creative Commons Attribution 4.0',
    short: 'CC BY',
    summary: 'The most open choice: anyone can do anything with it, as long as they credit you.',
    permissions: ['Use in class', 'Adapt', 'Share copies', 'Sell or use commercially'],
    conditions: ['Credit you'],
    limitations: [],
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  {
    id: 'all-rights-reserved',
    name: 'All rights reserved',
    short: 'All rights reserved',
    summary: 'Teachers can download and teach with it, but not re-share or post changed copies.',
    permissions: ['Use in class'],
    conditions: ['Credit you'],
    limitations: ['No re-sharing', 'No posting adaptations', 'No selling'],
  },
]

export const PAID_SUPPLEMENT_TERMS: Omit<License, 'id'> = {
  name: 'Buyer’s classroom use',
  short: 'Classroom use',
  summary: 'Each buyer can use the bundle in their own classes. It isn’t covered by the lesson-plan license.',
  permissions: ['Use in the buyer’s own classes', 'Edit for their own classes'],
  conditions: ['Credit you'],
  limitations: ['No re-sharing', 'No reselling'],
}

export const licenseById = (id: string | undefined) => LICENSES.find((license) => license.id === id)
