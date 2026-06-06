import Link from 'next/link'
import { Library, Star, Users, Search } from 'lucide-react'

const stats = [
  { label: 'Банкнот у каталозі', value: '0' },
  { label: 'Країн', value: '0' },
  { label: 'Колекціонерів', value: '0' },
]

const features = [
  {
    icon: Library,
    title: 'Загальний каталог',
    desc: 'Банкноти всіх країн з фото, описом та каталожними номерами',
  },
  {
    icon: Star,
    title: 'Моя колекція',
    desc: 'Відстежуйте що є у вас: стан, ціна, дата придбання',
  },
  {
    icon: Search,
    title: 'Пошук та фільтри',
    desc: 'Шукайте за країною, роком, номіналом, серією',
  },
  {
    icon: Users,
    title: 'Спільнота',
    desc: 'Обмінюйтесь банкнотами з колекціонерами з усього світу',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Ваш каталог банкнот
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Систематизуйте колекцію, знаходьте рідкісні банкноти, спілкуйтесь з колекціонерами
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/catalog" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-blue-700 px-6 py-3 font-semibold hover:bg-blue-50 transition-colors">
              <Library className="h-5 w-5" />
              Переглянути каталог
            </Link>
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/40 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-colors">
              Зареєструватись безкоштовно
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-blue-700">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Все що потрібно колекціонеру
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
