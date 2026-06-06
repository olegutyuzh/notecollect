'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState, useCallback } from 'react'
import type { Country } from '@/types/database'

interface CatalogFiltersProps {
  countries: Country[]
}

export function CatalogFilters({ countries }: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') ?? '')

  const applyFilters = useCallback((newQ: string, newCountry: string) => {
    const params = new URLSearchParams()
    if (newQ) params.set('q', newQ)
    if (newCountry) params.set('country', newCountry)
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters(q, searchParams.get('country') ?? '')
  }

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    applyFilters(q, e.target.value)
  }

  function clearSearch() {
    setQ('')
    applyFilters('', searchParams.get('country') ?? '')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Пошук за номіналом, серією, Pick №..."
            className="input pl-9 pr-8"
          />
          {q && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary px-5">
          Знайти
        </button>
      </form>

      {/* Country filter */}
      <select
        value={searchParams.get('country') ?? ''}
        onChange={handleCountryChange}
        className="input w-full sm:w-52"
      >
        <option value="">Всі країни</option>
        {countries.map((c) => (
          <option key={c.id} value={c.id}>
            {c.flag_emoji} {c.name_uk ?? c.name_en}
          </option>
        ))}
      </select>
    </div>
  )
}
