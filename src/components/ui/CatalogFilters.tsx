'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { Country, Currency } from '@/types/database'

interface CatalogFiltersProps {
  countries: Country[]
  currencies: Currency[]
  issuers: string[]
}

const MATERIALS = ['Paper', 'Polymer', 'Composite']

export function CatalogFilters({ countries, currencies, issuers }: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [expanded, setExpanded] = useState(false)

  // Form state — ініціалізуємо з URL
  const [q, setQ]                   = useState(searchParams.get('q') ?? '')
  const [issuer, setIssuer]         = useState(searchParams.get('issuer') ?? '')
  const [country, setCountry]       = useState(searchParams.get('country') ?? '')
  const [currency, setCurrency]     = useState(searchParams.get('currency') ?? '')
  const [yearFrom, setYearFrom]     = useState(searchParams.get('year_from') ?? '')
  const [yearTo, setYearTo]         = useState(searchParams.get('year_to') ?? '')
  const [series, setSeries]         = useState(searchParams.get('series') ?? '')
  const [material, setMaterial]     = useState(searchParams.get('material') ?? '')
  const [printer, setPrinter]       = useState(searchParams.get('printer') ?? '')
  const [pickNumber, setPickNumber] = useState(searchParams.get('pick') ?? '')

  const activeFiltersCount = [country, currency, yearFrom, yearTo, series, material, printer, pickNumber]
    .filter(Boolean).length

  function applyFilters() {
    const params = new URLSearchParams()
    if (q)          params.set('q', q)
    if (issuer)     params.set('issuer', issuer)
    if (country)    params.set('country', country)
    if (currency)   params.set('currency', currency)
    if (yearFrom)   params.set('year_from', yearFrom)
    if (yearTo)     params.set('year_to', yearTo)
    if (series)     params.set('series', series)
    if (material)   params.set('material', material)
    if (printer)    params.set('printer', printer)
    if (pickNumber) params.set('pick', pickNumber)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearAll() {
    setQ(''); setIssuer(''); setCountry(''); setCurrency('')
    setYearFrom(''); setYearTo(''); setSeries('')
    setMaterial(''); setPrinter(''); setPickNumber('')
    router.push(pathname)
  }

  const hasAnyFilter = q || issuer || country || currency || yearFrom || yearTo ||
    series || material || printer || pickNumber

  return (
    <div className="mb-8 card overflow-hidden">
      {/* Main search row */}
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        {/* Text search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            placeholder="Пошук за номіналом, серією, Pick №..."
            className="input pl-9"
          />
        </div>

        {/* Issuer (емітент) — головний фільтр */}
        <div className="relative sm:w-52">
          <input
            type="text"
            list="issuers-list"
            value={issuer}
            onChange={e => setIssuer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            placeholder="Всі емітенти..."
            className="input w-full"
          />
          {issuers.length > 0 && (
            <datalist id="issuers-list">
              {issuers.map(i => <option key={i} value={i} />)}
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

        {/* Search button */}
        <button onClick={applyFilters} className="btn-primary px-6 shrink-0">
          Знайти
        </button>
      </div>

      {/* Filter toggle row */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <SlidersHorizontal className="h-4 w-4" />
          + Додаткові фільтри
          {activeFiltersCount > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {hasAnyFilter && (
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
            Очистити все
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Країна</label>
            <select value={country} onChange={e => setCountry(e.target.value)} className="input">
              <option value="">Всі країни</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.flag_emoji} {c.name_uk ?? c.name_en}</option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Валюта</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="input">
              <option value="">Всі валюти</option>
              {currencies.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.name_uk ?? c.name_en}</option>
              ))}
            </select>
          </div>

          {/* Year range */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Рік</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={yearFrom}
                onChange={e => setYearFrom(e.target.value)}
                placeholder="від"
                className="input w-full"
              />
              <span className="text-gray-400 shrink-0">—</span>
              <input
                type="number"
                value={yearTo}
                onChange={e => setYearTo(e.target.value)}
                placeholder="до"
                className="input w-full"
              />
            </div>
          </div>

          {/* Series */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Серія</label>
            <input
              type="text"
              value={series}
              onChange={e => setSeries(e.target.value)}
              placeholder="назва серії"
              className="input"
            />
          </div>

          {/* Pick number */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Pick №</label>
            <input
              type="text"
              value={pickNumber}
              onChange={e => setPickNumber(e.target.value)}
              placeholder="напр. P-118"
              className="input"
            />
          </div>

          {/* Material */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Матеріал</label>
            <select value={material} onChange={e => setMaterial(e.target.value)} className="input">
              <option value="">Всі</option>
              {MATERIALS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Printer */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Друкарня</label>
            <input
              type="text"
              value={printer}
              onChange={e => setPrinter(e.target.value)}
              placeholder="назва друкарні"
              className="input"
            />
          </div>

          {/* Apply button inside expanded */}
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button onClick={applyFilters} className="btn-primary px-8">
              Застосувати фільтри
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
