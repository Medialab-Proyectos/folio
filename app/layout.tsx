import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/context/app-context'
import { StorageMigrator } from '@/components/shared/storage-migrator'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
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
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <StorageMigrator />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
