import { createServerSupabaseClient } from '@/lib/supabase-server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { CollectibleWithRelations, CollectibleVariation } from '@/types/database'
import { AddToCollectionButton } from '@/components/ui/AddToCollectionButton'
import { VariationsTable } from '@/components/ui/VariationsTable'

const CATEGORY_LABELS: Record<string, string> = {
  banknote: 'Банкнота',
  coin: 'Монета',
  exonumia: 'Екзонумія',
}

export default async function CollectiblePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const t = await getTranslations('Catalog')

  // Get current user (may be null for unauthenticated visitors)
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: collectible },
    { data: variations },
    { data: userItems },
  ] = await Promise.all([
    supabase
      .from('collectibles')
      .select('*, countries(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('collectible_variations')
      .select('*')
      .eq('collectible_id', id)
      .order('gregorian_year', { ascending: true }),
    user
      ? supabase
          .from('collected_items')
          .select('id, collectible_variation_id, grade, quantity')
          .eq('collectible_id', id)
          .eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  if (!collectible) notFound()

  const c = collectible as CollectibleWithRelations
  const country = c.countries
  const vars = (variations ?? []) as CollectibleVariation[]

  const years = c.max_year && c.max_year !== c.min_year
    ? `${c.min_year}–${c.max_year}`
    : c.min_year?.toString() ?? '—'

  const details = [
    { label: 'Категорія',  value: CATEGORY_LABELS[c.category] ?? c.category },
    { label: 'Тип',        value: c.object_type_name ?? '—' },
    { label: 'Емітент',    value: c.issuer_name ?? '—' },
    { label: 'Роки',       value: years },
    { label: 'Країна',     value: country ? `${country.flag_emoji ?? ''} ${country.name_uk ?? country.name_en}`.trim() : '—' },
    { label: 'Numista ID', value: c.id.toString() },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('backToCatalog')}
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          {c.obverse_thumbnail ? (
            <div className="card overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 text-xs text-gray-500">{t('detail.obverse')}</div>
              <div className="relative aspect-[2/1]">
                <Image
                  src={c.obverse_thumbnail.replace('-180.jpg', '-600.jpg')}
                  alt={t('detail.obverse')}
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
          ) : null}
          {c.reverse_thumbnail ? (
            <div className="card overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 text-xs text-gray-500">{t('detail.reverse')}</div>
              <div className="relative aspect-[2/1]">
                <Image
                  src={c.reverse_thumbnail.replace('-180.jpg', '-600.jpg')}
                  alt={t('detail.reverse')}
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
          ) : null}
          {!c.obverse_thumbnail && !c.reverse_thumbnail && (
            <div className="card flex items-center justify-center aspect-[2/1] text-gray-300">
              <p className="text-sm">{t('detail.noPhoto')}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{c.title}</h1>
          <p className="text-gray-500 mb-6">
            {country?.flag_emoji} {c.issuer_name}
            {c.min_year && ` · ${years}`}
          </p>

          <AddToCollectionButton collectible={c} />

          <div className="card divide-y divide-gray-100 mt-6">
            {details.map(({ label, value }) => (
              <div key={label} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>

          {/* Variations */}
          {vars.length > 0 && (
            <VariationsTable
              collectible={c}
              variations={vars}
              userItems={(userItems ?? []) as { id: number; collectible_variation_id: number | null; grade: string | null; quantity: number }[]}
              isLoggedIn={!!user}
            />
          )}
        </div>
      </div>
    </div>
  )
}
