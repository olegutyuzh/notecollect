import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'NoteCollect — Banknote Collection Catalog',
  description: 'Catalog and manage your banknote collection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white mt-16 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} NoteCollect
        </footer>
      </body>
    </html>
  )
}
