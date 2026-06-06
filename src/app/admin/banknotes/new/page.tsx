'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import type { Country, Currency } from '@/types/database'

const GRADES = ['UNC', 'AU', 'XF', 'VF', 'F', 'VG', 'G', 'AG', 'P']

export default function AddBanknotePage() {
  const router = useRouter()
  const supabase = createClient()
  const [countries, setCountries] = useState<Country[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    country_id: '',
    currency_id: '',
    denomination: '',
    denomination_text: '',
    year_from: '',
    year_to: '',
    series: '',
    pick_number: '',
    issuer: '',
    size_width_mm: '',
    size_height_mm: '',
    material: 'Paper',
    obverse_description: '',
    reverse_description: '',
    watermark: '',
    security_features: '',
    printer: '',
  })

  useEffect(() => {
    supabase.from('countries').select('*').order('name_uk').then(({ data }) => setCountries(data ?? []))
    supabase.from('currencies').select('*').order('name_en').then(({ data }) => setCurrencies(data ?? []))
  }, [])

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('banknotes').insert({
      country_id: form.country_id ? parseInt(form.country_id) : null,
      currency_id: form.currency_id ? parseInt(form.currency_id) : null,
      denomination: parseFloat(form.denomination),
      denomination_text: form.denomination_text || null,
      year_from: form.year_from ? parseInt(form.year_from) : null,
      year_to: form.year_to ? parseInt(form.year_to) : null,
      series: form.series || null,
      pick_number: form.pick_number || null,
      issuer: form.issuer || null,
      size_width_mm: form.size_width_mm ? parseFloat(form.size_width_mm) : null,
      size_height_mm: form.size_height_mm ? parseFloat(form.size_height_mm) : null,
      material: form.material || null,
      obverse_description: form.obverse_description || null,
      reverse_description: form.reverse_description || null,
      watermark: form.watermark || null,
      security_features: form.security_features || null,
      printer: form.printer || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/catalog')
    }
  }

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key as keyof typeof form]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Назад
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Додати банкноту</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main info */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Основна інформація</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Країна</label>
              <select value={form.country_id} onChange={e => set('country_id', e.target.value)} className="input">
                <option value="">— Оберіть країну —</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.flag_emoji} {c.name_uk ?? c.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
              <select value={form.currency_id} onChange={e => set('currency_id', e.target.value)} className="input">
                <option value="">— Оберіть валюту —</option>
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name_uk ?? c.name_en}</option>
                ))}
              </select>
            </div>
            {field('Номінал (число)', 'denomination', 'number', '100')}
            {field('Номінал (текст)', 'denomination_text', 'text', '100 гривень')}
            {field('Рік (від)', 'year_from', 'number', '1996')}
            {field('Рік (до, якщо є)', 'year_to', 'number', '2004')}
          </div>
        </div>

        {/* Catalog info */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Каталогова інформація</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('Серія', 'series', 'text', 'Перша серія')}
            {field('Pick №', 'pick_number', 'text', 'P-118')}
            {field('Емітент', 'issuer', 'text', 'Національний банк України')}
            {field('Друкарня', 'printer', 'text', 'TDLR')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Матеріал</label>
              <select value={form.material} onChange={e => set('material', e.target.value)} className="input">
                <option>Paper</option>
                <option>Polymer</option>
                <option>Composite</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {field('Ширина (мм)', 'size_width_mm', 'number', '133')}
              {field('Висота (мм)', 'size_height_mm', 'number', '66')}
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Описи</h2>
          <div className="space-y-4">
            {(['obverse_description', 'reverse_description', 'watermark', 'security_features'] as const).map(key => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key === 'obverse_description' ? 'Опис аверсу' :
                   key === 'reverse_description' ? 'Опис реверсу' :
                   key === 'watermark' ? 'Водяний знак' : 'Захисні елементи'}
                </label>
                <textarea
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  rows={2}
                  className="input resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3">
          <Link href="/catalog" className="btn-secondary flex-1 justify-center">Скасувати</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? 'Зберігаємо...' : 'Зберегти банкноту'}
          </button>
        </div>
      </form>
    </div>
  )
}
