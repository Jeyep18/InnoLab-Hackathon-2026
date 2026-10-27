// Homepage discovery state. Resource metadata remains unchanged.
import { replaceRoute, useRoute, withParams } from '@/router'
import { competencyKey, currentCurriculumReview, downloadCount, resourceRating } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { useStore } from '@/store'
import { hasPaidFiles } from '@/lib/pack'
import { useState } from 'react'

export const HOME_FILTER_KEYS = ['level', 'grade', 'subject', 'competency', 'quarter', 'week', 'needs', 'format', 'editable', 'review', 'supplement'] as const
export type HomeFilterKey = typeof HOME_FILTER_KEYS[number]
export type HomeFilters = Record<HomeFilterKey, string>
export interface HomeFilterOption { value: string; label: string }
export const HOME_SORTS = { relevance: 'Best match', top: 'Top reviewed', new: 'Newest', downloads: 'Most downloaded' } as const
export type HomeSort = keyof typeof HOME_SORTS
const EMPTY: HomeFilters = { level: '', grade: '', subject: '', competency: '', quarter: '', week: '', needs: '', format: '', editable: '', review: '', supplement: '' }
const MULTI_KEYS: readonly HomeFilterKey[] = ['subject', 'needs', 'format']
const selected = (value: string): string[] => value.split('|').filter(Boolean)
const LEVELS = ['Preschool', 'Elementary', 'High school', 'Senior high school']
const NEED_LABELS: Record<string, string> = { offline: 'No internet needed', internet: 'Requires internet', unspecified: 'Internet needs not specified', 'low-print': 'Low-print' }

export function schoolLevel(grade: string): string {
  if (/^(preschool|pre[- ]?k|kindergarten|kinder)(\b|$)/i.test(grade.trim())) return 'Preschool'
  const number = grade.match(/^grade\s+(\d+)$/i)?.[1]
  if (!number) return ''
  const value = Number(number)
  return value >= 1 && value <= 6 ? 'Elementary' : value <= 10 && value >= 7 ? 'High school' : value <= 12 && value >= 11 ? 'Senior high school' : ''
}


function internetNeed(resource: Resource): string {
  const requirements = resource.requirements.join(' ').toLowerCase()
  if (/\bno internet (needed|required)\b|\binternet not (needed|required)\b/.test(requirements) || resource.tags.includes('offline-ready')) return 'offline'
  if (/requires? (an? )?internet|internet (access |connection )?(needed|required)/.test(requirements) || resource.tags.includes('requires-internet')) return 'internet'
  return 'unspecified'
}
function fileFormats(resource: Resource): string[] {
  return resource.files.map(file => file.name.match(/\.([a-z\d]+)$/i)?.[1].toLowerCase() ?? '').filter(Boolean)
}
function optionsFor(values: string[]): HomeFilterOption[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map(value => ({ value, label: value }))
}
function sameCurriculum(resource: Resource, filters: HomeFilters): boolean {
  return (!filters.level || schoolLevel(resource.grade) === filters.level)
    && (!filters.grade || resource.grade === filters.grade)
    && (!filters.subject || selected(filters.subject).includes(resource.subject))
}

export function useHomeFilters(published: Resource[], inMemory = false) {
  const { reviews, state } = useStore()
  const route = useRoute()
  const [localParams, setLocalParams] = useState(() => new URLSearchParams())
  const params = inMemory ? localParams : route.params
  const query = params.get('q') ?? ''
  const filters: HomeFilters = { ...EMPTY }
  for (const key of HOME_FILTER_KEYS) filters[key] = params.get(key) ?? ''
  const requestedSort = params.get('sort') ?? 'relevance'
  const sort: HomeSort = Object.hasOwn(HOME_SORTS, requestedSort) ? requestedSort as HomeSort : 'relevance'
  const write = (next: HomeFilters, nextQuery = query, nextSort = sort) => {
    const path = withParams('/', { ...next, q: nextQuery, sort: nextSort === 'relevance' ? '' : nextSort })
    if (inMemory) setLocalParams(new URLSearchParams(path.split('?')[1] ?? ''))
    else replaceRoute(path)
  }
  const setQuery = (value: string) => write(filters, value)
  const setFilters = (updater: (previous: HomeFilters) => HomeFilters) => write(updater(filters))
  const inventory = published.filter(resource => resource.status === 'published')
  const curriculum = inventory.filter(resource => sameCurriculum(resource, filters))
  const gradeInventory = inventory.filter(resource => !filters.level || schoolLevel(resource.grade) === filters.level)
  const subjectInventory = gradeInventory.filter(resource => !filters.grade || resource.grade === filters.grade)
  const competencies = new Map(curriculum.map(resource => [competencyKey(resource), resource.competency.text || resource.competency.code]))
  const needs = new Set(inventory.map(internetNeed))
  if (inventory.some(resource => resource.tags.includes('low-print'))) needs.add('low-print')
  const options: Record<HomeFilterKey, HomeFilterOption[]> = {
    level: LEVELS.map(value => ({ value, label: value })),
    grade: optionsFor(gradeInventory.map(resource => resource.grade)),
    subject: optionsFor(subjectInventory.map(resource => resource.subject)),
    competency: [...competencies].filter(([value]) => value).map(([value, label]) => ({ value, label })),
    quarter: optionsFor(curriculum.map(resource => resource.bow.quarter)),
    week: optionsFor(curriculum.filter(resource => !filters.quarter || resource.bow.quarter === filters.quarter).map(resource => resource.bow.week)),
    needs: [...needs].map(value => ({ value, label: NEED_LABELS[value] })),
    format: optionsFor(inventory.flatMap(fileFormats)).map(option => ({ ...option, label: option.label.toUpperCase() })),
    editable: inventory.some(resource => resource.files.some(file => file.editable)) ? [{ value: 'yes', label: 'Includes editable files' }] : [],
    review: [
      ...(inventory.some(resource => currentCurriculumReview(resource)) ? [{ value: 'reviewed', label: 'Curriculum-reviewed' }] : []),
      ...(inventory.some(resource => !currentCurriculumReview(resource)) ? [{ value: 'unreviewed', label: 'Not yet curriculum-reviewed' }] : []),
      ...(inventory.some(resource => resourceRating(resource, reviews).count > 0) ? [{ value: 'has-reviews', label: 'Has current-version reviews' }] : []),
      ...(inventory.some(resource => resourceRating(resource, reviews).count === 0) ? [{ value: 'no-reviews', label: 'No current-version reviews' }] : []),
    ],
    supplement: [
      ...(inventory.some(resource => !hasPaidFiles(resource)) ? [{ value: 'free', label: 'Completely free' }] : []),
      ...(inventory.some(hasPaidFiles) ? [{ value: 'paid', label: 'Has paid files' }] : []),
    ],
  }
  const update = (key: HomeFilterKey, value: string) => setFilters(previous => {
    const next = { ...previous, [key]: value }
    if (key === 'level' && next.grade && !inventory.some(resource => sameCurriculum(resource, { ...next, subject: '' }))) next.grade = ''
    if ((key === 'level' || key === 'grade') && next.subject) {
      next.subject = selected(next.subject).filter(subject => inventory.some(resource => sameCurriculum(resource, { ...next, subject }))).join('|')
    }
    if (['level', 'grade', 'subject'].includes(key)) {
      if (next.competency && !inventory.some(resource => sameCurriculum(resource, next) && competencyKey(resource) === next.competency)) next.competency = ''
      if (next.quarter && !inventory.some(resource => sameCurriculum(resource, next) && resource.bow.quarter === next.quarter)) next.quarter = ''
    }
    if (['level', 'grade', 'subject', 'quarter'].includes(key) && next.week && !inventory.some(resource => sameCurriculum(resource, next) && (!next.quarter || resource.bow.quarter === next.quarter) && resource.bow.week === next.week)) next.week = ''
    return next
  })
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const results = inventory.filter(resource => {
    if (!sameCurriculum(resource, filters)) return false
    if (filters.competency && competencyKey(resource) !== filters.competency) return false
    if (filters.quarter && resource.bow.quarter !== filters.quarter) return false
    if (filters.week && resource.bow.week !== filters.week) return false
    if (filters.needs && !selected(filters.needs).some(need => need === 'low-print' ? resource.tags.includes('low-print') : internetNeed(resource) === need)) return false
    if (filters.format && !selected(filters.format).some(format => fileFormats(resource).includes(format))) return false
    if (filters.editable && !resource.files.some(file => file.editable)) return false
    // 'yes' is the old URL value for "has paid files".
    if (filters.supplement === 'free' && hasPaidFiles(resource)) return false
    if ((filters.supplement === 'paid' || filters.supplement === 'yes') && !hasPaidFiles(resource)) return false
    const rating = resourceRating(resource, reviews)
    if (filters.review === 'reviewed' && !currentCurriculumReview(resource)) return false
    if (filters.review === 'unreviewed' && currentCurriculumReview(resource)) return false
    if (filters.review === 'has-reviews' && !rating.count) return false
    if (filters.review === 'no-reviews' && rating.count) return false
    const text = [resource.title, resource.summary, resource.grade, resource.subject, resource.competency.code, resource.competency.text, ...resource.requirements, ...resource.tags].join(' ').toLowerCase()
    return terms.every(term => text.includes(term))
  })
  if (sort === 'top') results.sort((a, b) => {
    const left = resourceRating(a, reviews), right = resourceRating(b, reviews)
    return (right.mean ?? -1) - (left.mean ?? -1) || right.count - left.count
  })
  if (sort === 'new') results.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (sort === 'downloads') results.sort((a, b) => downloadCount(b, state) - downloadCount(a, state))
  const chips = HOME_FILTER_KEYS.flatMap(key => {
    const values = MULTI_KEYS.includes(key) ? selected(filters[key]) : [filters[key]].filter(Boolean)
    return values.map(value => ({ key, value, label: options[key].find(option => option.value === value)?.label ?? value }))
  })
  const applySearch = (nextQuery: string, nextFilters: HomeFilters) => write(nextFilters, nextQuery)
  const clear = () => write({ ...EMPTY }, '')
  const clearRefinements = () => write({ ...EMPTY })
  const hasSearch = terms.length > 0 || chips.length > 0
  const setSort = (value: string) => { if (Object.hasOwn(HOME_SORTS, value)) write(filters, query, value as HomeSort) }
  return { query, setQuery, applySearch, filters, update, clear, clearRefinements, chips, options, results, sort, setSort, hasSearch, total: results.length, publishedCount: inventory.length }
}

export type HomeFilterModel = ReturnType<typeof useHomeFilters>
