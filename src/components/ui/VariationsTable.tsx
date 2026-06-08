'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { AddToCollectionModal } from './AddToCollectionModal'
import type { CollectibleWithRelations, CollectibleVariation, NumistaSignature } from '@/types/database'

interface UserVariationItem {
  id: number
  collectible_variation_id: number | null
  grade: string | null
  quantity: number
}

interface Props {
  collectible: CollectibleWithRelations
  variations: CollectibleVariation[]
  userItems: UserVariationItem[]   // елементи колекції для цього collectible
  isLoggedIn: boolean
}

// Скорочення підписів: ініціали кожного підписанта
function sigInitials(sigs: NumistaSignature[]): string {
  return sigs
    .map(s => {
      const parts = s.signer_name.trim().split(/\s+/)
      // Беремо перші літери всіх слів у прізвищі (останнє слово + перше)
      return parts.map(p => p[0]?.toUpperCase() ?? '').join('')
    })
    .join(' / ')
}

function sigFullNames(sigs: NumistaSignature[]): string {
  return sigs.map(s => `${s.signer_name}${s.title ? ` (${s.title})` : ''}`).join('\n')
}

const GRADE_COLORS: Record<string, string> = {
  UNC: 'bg-emerald-100 text-emerald-800',
  AU:  'bg-teal-100 text-teal-800',
  XF:  'bg-blue-100 text-blue-800',
  VF:  'bg-sky-100 text-sky-800',
  F:   'bg-amber-100 text-amber-800',
  VG:  'bg-orange-100 text-orange-800',
  G:   'bg-red-100 text-red-800',
}

export function VariationsTable({ collectible, variations, userItems, isLoggedIn }: Props) {
  const [modalVariation, setModalVariation] = useState<CollectibleVariation | null>(null)

  // Будуємо map: variation_id → [items]
  const itemsByVariation = new Map<number, UserVariationItem[]>()
  for (const item of userItems) {
    if (item.collectible_variation_id) {
      const arr = itemsByVariation.get(item.collectible_variation_id) ?? []
      arr.push(item)
      itemsByVariation.set(item.collectible_variation_id, arr)
    }
  }
  // Елементи без варіанту
  const itemsNoVariation = userItems.filter(i => !i.collectible_variation_id)

  if (variations.length === 0) return null

  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Варіанти випуску
        <span className="ml-2 text-gray-400 font-normal">({variations.length})</span>
      </h2>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-16">Рік</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Підписи</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Коментар</th>
              {isLoggedIn && (
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-28">У колекції</th>
              )}
              {isLoggedIn && (
                <th className="px-3 py-2 w-10" />
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {variations.map((v) => {
              const sigs = (v.signatures as NumistaSignature[] | null) ?? []
              const initials = sigs.length > 0 ? sigInitials(sigs) : '—'
              const fullNames = sigs.length > 0 ? sigFullNames(sigs) : ''
              const myItems = itemsByVariation.get(v.id) ?? []
              const hasThis = myItems.length > 0

              return (
                <tr
                  key={v.id}
                  className={hasThis
                    ? 'bg-blue-50/60 hover:bg-blue-50'
                    : 'hover:bg-gray-50/70'
                  }
                >
                  {/* Рік */}
                  <td className="px-3 py-2.5 font-medium text-gray-900 tabular-nums">
                    {v.gregorian_year ?? v.year ?? '—'}
                  </td>

                  {/* Підписи */}
                  <td className="px-3 py-2.5">
                    {sigs.length > 0 ? (
                      <span
                        title={fullNames}
                        className="font-mono text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded cursor-default"
                      >
                        {initials}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Коментар */}
                  <td className="px-3 py-2.5 text-xs text-gray-500 hidden sm:table-cell max-w-[180px] truncate">
                    {v.comment ?? ''}
                  </td>

                  {/* У колекції */}
                  {isLoggedIn && (
                    <td className="px-3 py-2.5 text-center">
                      {hasThis ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {myItems.map((item) => (
                            <span
                              key={item.id}
                              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                                item.grade
                                  ? (GRADE_COLORS[item.grade.toUpperCase()] ?? 'bg-gray-100 text-gray-700')
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Check className="h-2.5 w-2.5" />
                              {item.quantity > 1 && `${item.quantity}×`}
                              {item.grade ?? '?'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-200 text-xs">—</span>
                      )}
                    </td>
                  )}

                  {/* Кнопка додати */}
                  {isLoggedIn && (
                    <td className="px-2 py-2.5 text-right">
                      <button
                        onClick={() => setModalVariation(v)}
                        title="Додати до колекції"
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Елементи без конкретного варіанту */}
        {isLoggedIn && itemsNoVariation.length > 0 && (
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <span>Без варіанту:</span>
            {itemsNoVariation.map(item => (
              <span
                key={item.id}
                className={`font-semibold px-1.5 py-0.5 rounded ${
                  item.grade
                    ? (GRADE_COLORS[item.grade.toUpperCase()] ?? 'bg-gray-100 text-gray-700')
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {item.quantity > 1 && `${item.quantity}×`}{item.grade ?? '?'}
              </span>
            ))}
          </div>
        )}
      </div>

      {modalVariation && (
        <AddToCollectionModal
          collectible={collectible}
          variation={modalVariation}
          onClose={() => setModalVariation(null)}
          onSuccess={() => setModalVariation(null)}
        />
      )}
    </div>
  )
}
