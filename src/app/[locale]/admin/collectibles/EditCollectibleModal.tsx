'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { updateCollectible } from './actions'
import type { CollectibleEditData } from './actions'

interface Country { id: number; name_uk: string | null; name_en: string | null; flag_emoji: string | null }

interface Collectible {
  id: number
  title: string
  issuer_name: string | null
  min_year: number | null
  max_year: number | null
  category_code: string
  country_id: number | null
}

interface Props {
  collectible: Collectible
  countries: Country[]
  onClose: () => void
}

const CATEGORIES = [
  { code: 'BKNT', label: 'Банкнота' },
  { code: 'COIN', label: 'Монета' },
  { code: 'EXON', label: 'Екзонумія' },
]

export function EditCollectibleModal({ collectible: c, countries, onClose }: Props) {
  const [form, setForm] = useState<CollectibleEditData>({
    title:        c.title,
    issuer_name:  c.issuer_name,
    min_year:     c.min_year,
    max_year:     c.max_year,
    category_code: c.category_code,
    country_id:   c.country_id,
  })
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof CollectibleEditData>(key: K, value: CollectibleEditData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function save() {
    setError(null)
    startTransition(async () => {
      try {
        await updateCollectible(c.id, form)
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Помилка')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Редагувати позицію #{c.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Назва</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Issuer */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Емітент</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.issuer_name ?? ''}
              onChange={e => set('issuer_name', e.target.value || null)}
            />
          </div>

          {/* Years */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Рік від</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.min_year ?? ''}
                onChange={e => set('min_year', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Рік до</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.max_year ?? ''}
                onChange={e => set('max_year', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Категорія</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              value={form.category_code}
              onChange={e => set('category_code', e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Країна</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              value={form.country_id ?? ''}
              onChange={e => set('country_id', e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">— без країни —</option>
              {countries.map(ct => (
                <option key={ct.id} value={ct.id}>
                  {ct.flag_emoji} {ct.name_uk ?? ct.name_en}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary text-sm">Скасувати</button>
          <button onClick={save} disabled={pending} className="btn-primary text-sm">
            {pending ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>
    </div>
  )
}
