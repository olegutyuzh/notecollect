'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { BookOpen, Library, Star, Menu, X, LogOut, Globe, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
  /** Admin status resolved server-side and passed as initial value */
  initialIsAdmin?: boolean
}

export function Header({ initialIsAdmin = false }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('Nav')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function syncUser(userId: string | undefined) {
      if (!userId) { setIsAdmin(false); return }
      const res = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      const profile = res.data as { role: string } | null
      setIsAdmin(profile?.role === 'admin')
    }

    // onAuthStateChange fires immediately with INITIAL_SESSION,
    // so no separate loadUser() call needed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      await syncUser(session?.user?.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const publicLinks = [
    { href: '/catalog' as const, label: t('catalog'), icon: Library, exact: false },
  ]

  const privateLinks = [
    { href: '/collection' as const, label: t('collection'), icon: Star, exact: true },
    { href: '/collection/stats' as const, label: t('stats'), icon: Globe, exact: false },
  ]

  const navLinks = [
    ...publicLinks,
    ...(user ? privateLinks : []),
    ...(isAdmin ? [{ href: '/admin' as const, label: 'Admin', icon: ShieldCheck, exact: false }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
            <BookOpen className="h-6 w-6" />
            NoteCollect
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon, exact }) => {
              const isAdminLink = href === '/admin'
              const isActive = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isAdminLink
                      ? isActive
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-violet-600 hover:bg-violet-50 hover:text-violet-800'
                      : isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="max-w-[140px] truncate">{user.email}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-52 card py-1 shadow-lg z-50">
                      <Link
                        href="/collection"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Star className="h-4 w-4" />
                        {t('collection')}
                      </Link>
                      <Link
                        href="/collection/stats"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Globe className="h-4 w-4" />
                        {t('stats')}
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-violet-700 hover:bg-violet-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Адмін-панель
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-sm">
                  {t('login')}
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            <div className="px-3 py-1">
              <LanguageSwitcher />
            </div>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Адмін-панель
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false) }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 py-1">
                <Link href="/auth/login" className="btn-secondary flex-1 justify-center" onClick={() => setMenuOpen(false)}>
                  {t('login')}
                </Link>
                <Link href="/auth/register" className="btn-primary flex-1 justify-center" onClick={() => setMenuOpen(false)}>
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
