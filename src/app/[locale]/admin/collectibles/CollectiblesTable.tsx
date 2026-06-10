'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import Image from 'next/image'
import { EditCollectibleModal } from './EditCollectibleModal'

interface Country { id: number; name_uk: string | null; name_en: string | null; flag_emoji: string | null }
interface Currency { id: number; name_en: string | null; name_uk: string | null; code: string | null }
interface Collectible {
  id: number
  title: string
  issuer_name: string | null
  min_year: number | null
  max_year: number | null
  category_code: string
  country_id: number | null
  currency_id: number | null
  obverse_thumbnail: string | null
  reverse_thumbnail: string | null
  countries: Country | null
}

interface Props {
  collectibles: Collectible[]
  countries: Country[]
  currencies: Currency[]
}

const CAT_LABEL: Record<string, string> = { BKNT: 'Банкнота', COIN: 'Монета', EXON: 'Екзонумія' }

export function CollectiblesTable({ collectibles, countries, currencies }: Props) {
  const [editing, setEditing] = useState<Collectible | null>(null)

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-16">ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 w-24">Фото</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Назва</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Емітент</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Країна</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Роки</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Тип</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {collectibles.map(c => {
              const years = c.max_year && c.max_year !== c.min_year
                ? `${c.min_year}–${c.max_year}`
                : c.min_year?.toString() ?? '—'
              const ct = c.countries
              return (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-2.5 text-gray-400 tabular-nums">{c.id}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {c.obverse_thumbnail ? (
                        <Image
                          src={c.obverse_thumbnail}
                          alt="аверс"
                          width={36}
                          height={22}
                          className="rounded object-cover border border-gray-100"
                          unoptimized
                        />
                      ) : (
                        <div className="w-9 h-[22px] rounded border border-dashed border-gray-200 bg-gray-50" />
                      )}
                      {c.reverse_thumbnail ? (
                        <Image
                          src={c.reverse_thumbnail}
                          alt="реверс"
                          width={36}
                          height={22}
                          className="rounded object-cover border border-gray-100"
                          unoptimized
                        />
                      ) : (
                        <div className="w-9 h-[22px] rounded border border-dashed border-gray-200 bg-gray-50" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-900 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-4 py-2.5 text-gray-500 max-w-[130px] truncate">{c.issuer_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {ct ? `${ct.flag_emoji ?? ''} ${ct.name_uk ?? ct.name_en ?? ''}`.trim() : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 tabular-nums">{years}</td>
                  <td className="px-4 py-2.5 text-gray-500">{CAT_LABEL[c.category_code] ?? c.category_code}</td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setEditing(c)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditCollectibleModal
          collectible={editing}
          countries={countries}
          currencies={currencies}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
