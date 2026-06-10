import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Library, Star, Users, Search } from 'lucide-react'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

interface HomepageStats {
  notes_count: number
  countries_count: number
  collectors_count: number
}

async function getStats(): Promise<HomepageStats> {
  try {
    const admin = createAdminSupabaseClient()
    const { data, error } = await admin.rpc('get_homepage_stats')
    if (error || !data) return { notes_count: 0, countries_count: 0, collectors_count: 0 }
    return data as HomepageStats
  } catch {
    return { notes_count: 0, countries_count: 0, collectors_count: 0 }
  }
}

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString('uk-UA')
  return String(n)
}

export default async function HomePage() {
  const t = await getTranslations('Home')
  const stats = await getStats()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('hero.title')}</h1>
          <p className="text-blue-100 text-lg mb-8">{t('hero.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/catalog" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-blue-700 px-6 py-3 font-semibold hover:bg-blue-50 transition-colors">
              <Library className="h-5 w-5" />
              {t('hero.browse')}
            </Link>
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/40 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-colors">
              {t('hero.registerFree')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.notes_count)}</p>
              <p className="text-sm text-gray-500 mt-1">{t('statsSection.notes')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.countries_count)}</p>
              <p className="text-sm text-gray-500 mt-1">{t('statsSection.countries')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.collectors_count)}</p>
              <p className="text-sm text-gray-500 mt-1">{t('statsSection.collectors')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            {t('features.heading')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {([
              [Library, 'catalog'],
              [Star,    'collection'],
              [Search,  'search'],
              [Users,   'community'],
            ] as [React.ElementType, string][]).map(([Icon, key]) => (
              <div key={key} className="card p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t(`features.${key}.title` as any)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(`features.${key}.desc` as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
