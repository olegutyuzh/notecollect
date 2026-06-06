'use client'

import { useState, useRef } from 'react'
import { X, Upload, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { BanknoteWithRelations } from '@/types/database'

const GRADES = ['P', 'AG', 'G', 'VG', 'F', 'VF', 'XF', 'AU', 'UNC']
const GRADING_COMPANIES = ['PMG', 'PCGS', 'NGC', 'IBNS', 'Інша']

interface Props {
  banknote: BanknoteWithRelations
  onClose: () => void
  onSuccess?: () => void
}

export function AddToCollectionModal({ banknote, onClose, onSuccess }: Props) {
  const [grade, setGrade]               = useState('')
  const [quantity, setQuantity]         = useState(1)
  const [price, setPrice]               = useState('')
  const [privateNote, setPrivateNote]   = useState('')
  const [publicNote, setPublicNote]     = useState('')
  const [forTrade, setForTrade]         = useState(false)
  const [forSale, setForSale]           = useState(false)
  const [serialNumber, setSerialNumber] = useState('')

  // Grading section
  const [gradingOpen, setGradingOpen]         = useState(false)
  const [gradingCompany, setGradingCompany]   = useState('')
  const [gradingScore, setGradingScore]       = useState('')
  const [designation, setDesignation]         = useState('')
  const [certNumber, setCertNumber]           = useState('')

  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const country  = banknote.countries
  const currency = banknote.currencies

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave(addAgain = false) {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Потрібна авторизація'); setLoading(false); return }

    // Upload image
    let imageUrl: string | null = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `collection/${user.id}/${banknote.id}_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('banknotes').upload(path, imageFile)
      if (!uploadError) {
        const { data } = supabase.storage.from('banknotes').getPublicUrl(path)
        imageUrl = data.publicUrl
      }
    }

    const { error: insertError } = await supabase
      .from('user_collections')
      .upsert({
        user_id:          user.id,
        banknote_id:      banknote.id,
        grade:            grade || null,
        quantity,
        purchase_price:   price ? parseFloat(price) : null,
        notes:            privateNote || null,
        public_notes:     publicNote || null,
        serial_number:    serialNumber || null,
        grading_company:  gradingCompany || null,
        grading_score:    gradingScore || null,
        designation:      designation || null,
        cert_number:      certNumber || null,
        image_url:        imageUrl,
        for_trade:        forTrade,
        for_sale:         forSale,
      }, { onConflict: 'user_id,banknote_id' })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else if (addAgain) {
      setGrade(''); setQuantity(1); setPrice(''); setPrivateNote(''); setPublicNote('')
      setForTrade(false); setForSale(false); setSerialNumber('')
      setGradingCompany(''); setGradingScore(''); setDesignation(''); setCertNumber('')
      setImageFile(null); setImagePreview(null)
      setLoading(false)
    } else {
      onSuccess?.()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-gray-900">Додати до колекції</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Banknote info */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
          {country?.flag_emoji} <span className="font-medium text-gray-900">{banknote.denomination_text}</span>
          {' · '}{country?.name_uk ?? country?.name_en}
          {banknote.year_from && ` · ${banknote.year_from}`}
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Стан (Grade)</label>
            <div className="flex flex-wrap gap-1.5">
              {GRADES.map(g => (
                <button key={g} type="button" onClick={() => setGrade(grade === g ? '' : g)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    grade === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Кількість</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input type="number" min={1} value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="input w-20 text-center" />
              <button type="button" onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Purchase price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ціна купівлі</label>
            <div className="flex gap-2 items-center">
              <input type="number" step="0.01" min="0" value={price}
                onChange={e => setPrice(e.target.value)} placeholder="0.00" className="input w-36" />
              <span className="text-sm text-gray-500">{currency?.code ?? 'USD'}</span>
            </div>
          </div>

          {/* Serial number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Серійний номер</label>
            <input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)}
              placeholder="напр. AA1234567B" className="input" />
          </div>

          {/* For trade / sale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Для обміну / продажу</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setForTrade(v => !v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  forTrade ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                }`}>Обмін</button>
              <button type="button" onClick={() => setForSale(v => !v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  forSale ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}>Продаж</button>
            </div>
          </div>

          {/* Grading section (collapsible) */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setGradingOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                Оцінка (Grading)
                {(gradingCompany || gradingScore) && (
                  <span className="badge bg-blue-50 text-blue-700">
                    {[gradingCompany, gradingScore].filter(Boolean).join(' ')}
                  </span>
                )}
              </span>
              {gradingOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {gradingOpen && (
              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-100 bg-gray-50">
                {/* Company */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Компанія</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GRADING_COMPANIES.map(c => (
                      <button key={c} type="button" onClick={() => setGradingCompany(gradingCompany === c ? '' : c)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          gradingCompany === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Оцінка (Score)</label>
                  <input type="text" value={gradingScore} onChange={e => setGradingScore(e.target.value)}
                    placeholder="напр. 66, 67 EPQ, MS-65" className="input" />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Designation</label>
                  <input type="text" value={designation} onChange={e => setDesignation(e.target.value)}
                    placeholder="напр. EPQ, PPQ, Star, Gem" className="input" />
                </div>

                {/* Cert number */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Номер сертифікату</label>
                  <input type="text" value={certNumber} onChange={e => setCertNumber(e.target.value)}
                    placeholder="напр. 1234567-001" className="input" />
                </div>
              </div>
            )}
          </div>

          {/* Private note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Особиста нотатка</label>
            <p className="text-xs text-gray-400 mb-1.5">Видно тільки вам</p>
            <textarea value={privateNote} onChange={e => setPrivateNote(e.target.value)}
              rows={2} placeholder="Де знайшли, особливості..." className="input resize-none" />
          </div>

          {/* Public comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Публічний коментар</label>
            <p className="text-xs text-gray-400 mb-1.5">Видно всім користувачам</p>
            <textarea value={publicNote} onChange={e => setPublicNote(e.target.value)}
              rows={2} placeholder="Цікавий факт, особливість банкноти..." className="input resize-none" />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Фото</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="" className="max-h-32 mx-auto rounded-lg object-contain" />
                  <p className="text-xs text-gray-400 mt-2">{imageFile?.name}</p>
                </div>
              ) : (
                <div className="py-2">
                  <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Клікніть або перетягніть фото</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG до 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button onClick={() => handleSave(false)} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? 'Зберігаємо...' : 'Зберегти'}
          </button>
          <button onClick={() => handleSave(true)} disabled={loading} className="btn-secondary flex-1 justify-center text-sm">
            Зберегти та ще
          </button>
        </div>
      </div>
    </div>
  )
}
