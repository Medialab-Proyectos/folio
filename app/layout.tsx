import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/context/app-context'
import { StorageMigrator } from '@/components/shared/storage-migrator'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'GarageFolio - Garage Management System',
  description: 'Enterprise B2B garage and vehicle inventory management',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${nunito.variable} font-sans antialiased`}>
        <StorageMigrator />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
