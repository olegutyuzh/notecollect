import { createServerSupabaseClient } from '@/lib/supabase-server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { BanknoteWithRelations } from '@/types/database'
import { AddToCollectionButton } from '@/components/ui/AddToCollectionButton'

export default async function BanknotePage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()

  const { data: banknote } = await supabase
    .from('banknotes')
    .select('*, countries(*), currencies(*)')
    .eq('id', params.id)
    .single()

  if (!banknote) notFound()

  const b = banknote as BanknoteWithRelations
  const country = b.countries
  const currency = b.currencies

  const details = [
    { label: 'Країна', value: `${country?.flag_emoji ?? ''} ${country?.name_uk ?? country?.name_en ?? '—'}` },
    { label: 'Номінал', value: b.denomination_text ?? `${b.denomination} ${currency?.code ?? ''}` },
    { label: 'Рік(и)', value: b.year_to ? `${b.year_from}–${b.year_to}` : b.year_from?.toString() ?? '—' },
    { label: 'Серія', value: b.series ?? '—' },
    { label: 'Pick №', value: b.pick_number ?? '—' },
    { label: 'Емітент', value: b.issuer ?? '—' },
    { label: 'Матеріал', value: b.material ?? '—' },
    { label: 'Розмір', value: b.size_width_mm ? `${b.size_width_mm} × ${b.size_height_mm} мм` : '—' },
    { label: 'Друкарня', value: b.printer ?? '—' },
    { label: 'Водяний знак', value: b.watermark ?? '—' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Назад до каталогу
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          {b.image_obverse_url && (
            <div className="card overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 text-xs text-gray-500">Аверс</div>
              <div className="relative aspect-[2/1]">
                <Image src={b.image_obverse_url} alt="Аверс" fill className="object-contain p-2" />
              </div>
            </div>
          )}
          {b.image_reverse_url && (
            <div className="card overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 text-xs text-gray-500">Реверс</div>
              <div className="relative aspect-[2/1]">
                <Image src={b.image_reverse_url} alt="Реверс" fill className="object-contain p-2" />
              </div>
            </div>
          )}
          {!b.image_obverse_url && !b.image_reverse_url && (
            <div className="card flex items-center justify-center aspect-[2/1] text-gray-300">
              <p className="text-sm">Фото відсутнє</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {b.denomination_text ?? `${b.denomination} ${currency?.code ?? ''}`}
          </h1>
          <p className="text-gray-500 mb-6">
            {country?.flag_emoji} {country?.name_uk ?? country?.name_en}
            {b.year_from && ` · ${b.year_from}`}
          </p>

          {/* Client button that opens modal */}
          <AddToCollectionButton banknote={b} />

          {/* Details table */}
          <div className="card divide-y divide-gray-100 mt-6">
            {details.map(({ label, value }) => (
              <div key={label} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>

          {b.obverse_description && (
            <div className="mt-4 card p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Опис аверсу</p>
              <p className="text-sm text-gray-700 leading-relaxed">{b.obverse_description}</p>
            </div>
          )}
          {b.reverse_description && (
            <div className="mt-3 card p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Опис реверсу</p>
              <p className="text-sm text-gray-700 leading-relaxed">{b.reverse_description}</p>
            </div>
          )}
          {b.security_features && (
            <div className="mt-3 card p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Захисні елементи</p>
              <p className="text-sm text-gray-700 leading-relaxed">{b.security_features}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
