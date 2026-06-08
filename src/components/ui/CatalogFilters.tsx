'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface CatalogFiltersProps {
  issuers: string[]
}

const CATEGORIES = [
  { value: 'banknote',  label: 'Банкноти' },
  { value: 'coin',      label: 'Монети' },
  { value: 'exonumia',  label: 'Екзонумія' },
]

export function CatalogFilters({ issuers }: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('Catalog')

  const [expanded, setExpanded] = useState(false)

  const [q, setQ]               = useState(searchParams.get('q') ?? '')
  const [issuer, setIssuer]     = useState(searchParams.get('issuer') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [yearFrom, setYearFrom] = useState(searchParams.get('year_from') ?? '')
  const [yearTo, setYearTo]     = useState(searchParams.get('year_to') ?? '')

  const activeCount = [issuer, category, yearFrom, yearTo].filter(Boolean).length

  function applyFilters() {
    const params = new URLSearchParams()
    if (q)        params.set('q', q)
    if (issuer)   params.set('issuer', issuer)
    if (category) params.set('category', category)
    if (yearFrom) params.set('year_from', yearFrom)
    if (yearTo)   params.set('year_to', yearTo)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearAll() {
    setQ(''); setIssuer(''); setCategory(''); setYearFrom(''); setYearTo('')
    router.push(pathname)
  }

  const hasAnyFilter = q || issuer || category || yearFrom || yearTo

  return (
    <div className="mb-8 card overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        {/* Text search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            placeholder={t('filters.searchPlaceholder')}
            className="input pl-9"
            suppressHydrationWarning
          />
        </div>

        {/* Issuer autocomplete */}
        <div className="relative sm:w-56">
          <input
            type="text"
            list="issuers-list"
            value={issuer}
            onChange={e => setIssuer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            placeholder={t('filters.allIssuers')}
            className="input w-full"
            suppressHydrationWarning
          />
          {issuers.length > 0 && (
            <datalist id="issuers-list">
              {issuers.slice(0, 200).map(i => <option key={i} value={i} />)}
            </datalist>
          )}
          {issuer && (
            <button
              type="button"
              onClick={() => setIssuer('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={applyFilters}
          className="btn-primary px-6 shrink-0"
          suppressHydrationWarning
        >
          {t('filters.search')}
        </button>
      </div>

      {/* More filters toggle */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          suppressHydrationWarning
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('filters.moreFilters')}
          {activeCount > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {hasAnyFilter && (
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
            {t('filters.clearAll')}
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Категорія</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input">
              <option value="">Всі категорії</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Year range */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('filters.year')}</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={yearFrom}
                onChange={e => setYearFrom(e.target.value)}
                placeholder={t('filters.from')}
                className="input w-full"
              />
              <span className="text-gray-400 shrink-0">—</span>
              <input
                type="number"
                value={yearTo}
                onChange={e => setYearTo(e.target.value)}
                placeholder={t('filters.to')}
                className="input w-full"
              />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button onClick={applyFilters} className="btn-primary px-8">
              {t('filters.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
