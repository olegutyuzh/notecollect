import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CollectiblesTable } from './CollectiblesTable'

interface SearchParams { q?: string; page?: string }

const PAGE_SIZE = 50

export default async function AdminCollectiblesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const supabase = await createServerSupabaseClient()

  const page = Math.max(1, parseInt(sp.page ?? '1') || 1)
  const offset = (page - 1) * PAGE_SIZE

  // Count
  let countQ = supabase.from('collectibles').select('*', { count: 'exact', head: true })
  if (sp.q) countQ = countQ.ilike('title', `%${sp.q}%`)
  const { count: total } = await countQ

  // Data
  let dataQ = supabase
    .from('collectibles')
    .select('id, title, issuer_name, min_year, max_year, category_code, country_id, countries(id, name_uk, name_en, flag_emoji)')
    .order('id', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)
  if (sp.q) dataQ = dataQ.ilike('title', `%${sp.q}%`)
  const { data: collectibles } = await dataQ

  // Countries for edit dropdown
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name_uk, name_en, flag_emoji')
    .order('name_uk')

  const totalPages = Math.ceil((total ?? 0) / PAGE_SIZE)

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (sp.q) params.set('q', sp.q)
    params.set('page', String(p))
    return `/admin/collectibles?${params.toString()}`
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Каталог</h1>
      <p className="text-gray-500 text-sm mb-6">
        {total ?? 0} позицій
        {totalPages > 1 && ` · стор. ${page} з ${totalPages}`}
      </p>

      {/* Search */}
      <form className="mb-5 flex gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Пошук за назвою..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" className="btn-primary text-sm">Шукати</button>
        {sp.q && (
          <a href="/admin/collectibles" className="btn-secondary text-sm">Скинути</a>
        )}
      </form>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CollectiblesTable collectibles={(collectibles ?? []) as any} countries={(countries ?? []) as any} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-5 justify-center">
          {page > 1 && (
            <a href={pageHref(page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">‹ Назад</a>
          )}
          <span className="text-sm text-gray-500">Стор. {page} з {totalPages}</span>
          {page < totalPages && (
            <a href={pageHref(page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Далі ›</a>
          )}
        </div>
      )}
    </div>
  )
}
