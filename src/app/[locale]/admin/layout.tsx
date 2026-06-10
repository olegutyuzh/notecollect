import { requireAdmin } from '@/lib/auth-helpers'
import { Link } from '@/i18n/navigation'
import { LayoutDashboard, Users, BookOpen, ChevronLeft } from 'lucide-react'

const NAV = [
  { href: '/admin',              label: 'Дашборд',   icon: LayoutDashboard },
  { href: '/admin/users',        label: 'Користувачі', icon: Users },
  { href: '/admin/collectibles', label: 'Каталог',   icon: BookOpen },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">CollectorHub</p>
          <p className="text-sm font-bold text-gray-900">Адмін-панель</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            На сайт
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-8">
        {children}
      </main>
    </div>
  )
}
