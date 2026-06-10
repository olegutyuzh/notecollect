import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { Link } from '@/i18n/navigation'
import { BookOpen, Users, Star, ArrowRight } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const adminClient = createAdminSupabaseClient()

  const [
    { count: catalogCount },
    { count: itemsCount },
    { data: usersData },
  ] = await Promise.all([
    supabase.from('collectibles').select('*', { count: 'exact', head: true }),
    supabase.from('collected_items').select('*', { count: 'exact', head: true }),
    adminClient.auth.admin.listUsers(),
  ])

  const userCount = usersData?.users?.length ?? 0

  const stats = [
    { label: 'Позицій у каталозі', value: catalogCount ?? 0, icon: BookOpen, href: '/admin/collectibles', color: 'text-blue-600 bg-blue-50' },
    { label: 'Користувачів',       value: userCount,          icon: Users,    href: '/admin/users',        color: 'text-violet-600 bg-violet-50' },
    { label: 'Записів у колекціях',value: itemsCount ?? 0,    icon: Star,     href: null,                  color: 'text-emerald-600 bg-emerald-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Дашборд</h1>
      <p className="text-gray-500 text-sm mb-8">Загальна статистика системи</p>

      <div className="grid grid-cols-3 gap-5 mb-10">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`inline-flex p-2.5 rounded-lg ${color} mb-4`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500">{label}</p>
              {href && (
                <Link href={href} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                  Детальніше <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Link href="/admin/users" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-violet-500" />
            <h2 className="font-semibold text-gray-900">Управління користувачами</h2>
          </div>
          <p className="text-sm text-gray-500">Перегляд користувачів, зміна ролей (user / admin)</p>
          <p className="text-xs text-blue-600 mt-3 group-hover:underline flex items-center gap-1">
            Відкрити <ArrowRight className="h-3 w-3" />
          </p>
        </Link>

        <Link href="/admin/collectibles" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Редагування каталогу</h2>
          </div>
          <p className="text-sm text-gray-500">Редагування банкнот у каталозі: назва, емітент, роки, країна</p>
          <p className="text-xs text-blue-600 mt-3 group-hover:underline flex items-center gap-1">
            Відкрити <ArrowRight className="h-3 w-3" />
          </p>
        </Link>
      </div>
    </div>
  )
}
