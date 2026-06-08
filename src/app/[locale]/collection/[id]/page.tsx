import { createServerSupabaseClient } from '@/lib/supabase-server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Award, Banknote, Calendar, Hash, Info, Layers, Star } from 'lucide-react'
import type { CollectedItemFull, CollectibleVariation, NumistaSignature, NumistaPicture } from '@/types/database'
import { getTranslations } from 'next-intl/server'
import { VariationsTable } from '@/components/ui/VariationsTable'

interface Props { params: Promise<{ id: string }> }

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 w-44 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 flex-1">{value}</span>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        <Icon className="h-4 w-4 text-blue-500" />
        {title}
      </h2>
      {children}
    </div>
  )
}

const GRADE_COLORS: Record<string, string> = {
  UNC: 'bg-emerald-50 text-emerald-700', AU: 'bg-teal-50 text-teal-700',
  XF: 'bg-blue-50 text-blue-700',        VF: 'bg-sky-50 text-sky-700',
  F: 'bg-amber-50 text-amber-700',       VG: 'bg-orange-50 text-orange-700',
  G: 'bg-red-50 text-red-700',
}

export default async function CollectedItemPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const t = await getTranslations('CollectionItem')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: item } = await supabase
    .from('collected_items')
    .select('*, collectibles(*, countries(*)), collectible_variations(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!item) notFound()

  const collectibleId = (item as CollectedItemFull).collectibles?.id

  // Fetch all variations + user's other items for this collectible in parallel
  const [{ data: allVariations }, { data: allUserItems }] = await Promise.all([
    collectibleId
      ? supabase
          .from('collectible_variations')
          .select('*')
          .eq('collectible_id', collectibleId)
          .order('gregorian_year', { ascending: true })
      : Promise.resolve({ data: [] }),
    collectibleId
      ? supabase
          .from('collected_items')
          .select('id, collectible_variation_id, grade, quantity')
          .eq('collectible_id', collectibleId)
          .eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const col = item as CollectedItemFull
  const c   = col.collectibles
  const v   = col.collectible_variations
  const country = c?.countries
  const pictures = (col.pictures as NumistaPicture[] | null) ?? []
  const sigs = v ? ((v.signatures as NumistaSignature[] | null) ?? []) : []
  const gradeClass = col.grade
    ? (GRADE_COLORS[col.grade.toUpperCase()] ?? 'bg-gray-100 text-gray-700')
    : ''

  const years = c?.max_year && c?.max_year !== c?.min_year
    ? `${c.min_year}–${c.max_year}`
    : c?.min_year?.toString() ?? '—'

  const f = (k: string) => t(`fields.${k}` as any)
  const s = (k: string) => t(`sections.${k}` as any)

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/collection"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {country?.flag_emoji} {c?.title}
        </h1>
        <p className="text-gray-500 mt-1">
          {c?.issuer_name}
          {years !== '—' && ` · ${years}`}
          {v && (
            <span className="text-gray-400">
              {' · '}{v.gregorian_year ?? v.year ?? 'б/р'}
              {v.comment && ` — ${v.comment}`}
            </span>
          )}
        </p>
      </div>

      {/* Catalog images */}
      {(c?.obverse_thumbnail || c?.reverse_thumbnail) && (
        <div className="flex gap-4 mb-6 flex-wrap">
          {c.obverse_thumbnail && (
            <div className="relative h-44 flex-1 min-w-[180px] rounded-xl overflow-hidden bg-gray-100 shadow">
              <Image
                src={c.obverse_thumbnail.replace('-180.jpg', '-600.jpg')}
                alt={t('obverse')}
                fill
                className="object-contain p-2"
              />
              <span className="absolute bottom-2 left-2 text-xs text-gray-400 bg-white/80 rounded px-1.5 py-0.5">
                {t('obverse')}
              </span>
            </div>
          )}
          {c.reverse_thumbnail && (
            <div className="relative h-44 flex-1 min-w-[180px] rounded-xl overflow-hidden bg-gray-100 shadow">
              <Image
                src={c.reverse_thumbnail.replace('-180.jpg', '-600.jpg')}
                alt={t('reverse')}
                fill
                className="object-contain p-2"
              />
              <span className="absolute bottom-2 left-2 text-xs text-gray-400 bg-white/80 rounded px-1.5 py-0.5">
                {t('reverse')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* User's own photos */}
      {pictures.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {pictures.map((pic, i) => (
            <div key={i} className="relative h-40 w-40 rounded-xl overflow-hidden bg-gray-100 shadow">
              <Image src={pic.url} alt="" fill className="object-contain p-1" />
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* My copy */}
        <Section title={s('myCopy')} icon={Star}>
          <div>
            {col.grade && (
              <div className="flex gap-3 py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500 w-44 shrink-0">{f('grade')}</span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded ${gradeClass}`}>
                  {col.grade}
                </span>
              </div>
            )}
            <Row label={f('quantity')} value={col.quantity > 1 ? `${col.quantity} ${t('pcsUnit')}` : null} />
            <Row label={f('serial')} value={col.serial_number} />
            <Row
              label={f('price')}
              value={col.price_value != null
                ? `${col.price_value} ${col.price_currency ?? 'USD'}`
                : null}
            />
            <Row label={f('forTrade')} value={col.for_swap ? f('yes') : null} />
            {col.private_comment && (
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                {col.private_comment}
              </div>
            )}
            {col.public_comment && (
              <div className="mt-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 leading-relaxed">
                <span className="text-xs text-blue-500 font-medium block mb-0.5">Публічний коментар</span>
                {col.public_comment}
              </div>
            )}
          </div>
        </Section>

        {/* Grading slab */}
        {(col.grading_company || col.slab_grade) && (
          <Section title={s('grading')} icon={Award}>
            <div>
              <Row label={f('company')} value={col.grading_company} />
              <Row label={f('score')} value={col.slab_grade} />
              <Row label={f('certNo')} value={col.slab_number} />
            </div>
          </Section>
        )}

        {/* Catalog info */}
        <Section title={s('general')} icon={Info}>
          <div>
            <Row label="Назва"    value={c?.title} />
            <Row label="Емітент"  value={c?.issuer_name} />
            <Row label="Країна"   value={country ? `${country.flag_emoji ?? ''} ${country.name_uk ?? country.name_en}`.trim() : null} />
            <Row label="Категорія" value={c?.category} />
            <Row label="Роки"     value={years} />
            <Row label="Numista ID" value={c?.id?.toString()} />
          </div>
        </Section>

        {/* Variation details (compact, only if has a variation assigned) */}
        {v && (
          <Section title="Варіант випуску" icon={Calendar}>
            <div>
              <Row label="Рік"         value={v.gregorian_year ?? v.year} />
              <Row label="Коментар"    value={v.comment} />
              {sigs.length > 0 && (
                <div className="py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">Підписи</span>
                  <div className="mt-1 space-y-0.5">
                    {sigs.map((sig, i) => (
                      <p key={i} className="text-sm text-gray-900">
                        {sig.signer_name}
                        {sig.title && <span className="text-gray-400"> — {sig.title}</span>}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* All variations for this collectible */}
      {c && (allVariations ?? []).length > 0 && (
        <VariationsTable
          collectible={c}
          variations={(allVariations ?? []) as CollectibleVariation[]}
          userItems={(allUserItems ?? []) as { id: number; collectible_variation_id: number | null; grade: string | null; quantity: number }[]}
          isLoggedIn={true}
        />
      )}
    </div>
  )
}
