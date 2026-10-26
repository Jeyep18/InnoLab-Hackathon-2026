import { useState, type FormEvent } from 'react'
import { resourceRating } from '@/domain/logic'
import { uniqueSorted } from '@/lib/pack'
import { navigate, withParams } from '@/router'
import { useStore } from '@/store'

export function useHomeLibrary() {
  const { resources, reviews } = useStore()
  const [query, setQuery] = useState('')
  const published = resources.filter((resource) => resource.status === 'published')
  const grades = uniqueSorted(published.map((resource) => resource.grade))
  const subjects = uniqueSorted(published.map((resource) => resource.subject))
  const topReviewed = published
    .map((resource) => ({ resource, rating: resourceRating(resource, reviews) }))
    .filter(({ rating }) => rating.mean !== null && rating.count >= 2)
    .sort((a, b) => (b.rating.mean ?? 0) - (a.rating.mean ?? 0) || b.rating.count - a.rating.count)
    .slice(0, 3)
    .map(({ resource }) => resource)
  const recent = [...published].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(withParams('/browse', { q: query.trim() }))
  }
  return { query, setQuery, published, grades, subjects, topReviewed, recent, submit }
}

export type HomeLibrary = ReturnType<typeof useHomeLibrary>
