import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Sidebar } from '@/components/navigation/sidebar'
import { MobileNav } from '@/components/navigation/mobile-nav'
import { SearchCommand } from '@/components/navigation/search-command'
import { PwaInstructionsModal } from '@/components/pwa-instructions-modal'
import { PwaRegister } from '@/components/pwa-register'
import { PrintThemeHandler } from '@/components/print-theme-handler'
import { fetchTimetableList } from '@/lib/timetable/fetch-list.js'
import { schoolConfig } from '@/school.config'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export const metadata = {
  title: {
    template: `%s | ${schoolConfig.shortName}`,
    default: schoolConfig.meta.title || `NeoPlan — ${schoolConfig.shortName}`,
  },
  description: schoolConfig.meta.description,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: schoolConfig.branding?.logo || '/logo.svg',
    apple: '/apple-icon',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: schoolConfig.shortName || 'NeoPlan',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default async function RootLayout({ children }) {
  let listData = null
  try {
    listData = await fetchTimetableList()
  } catch (error) {
    console.error('Błąd pobierania listy jednostek:', error)
  }

  return (
    <html lang="pl" suppressHydrationWarning className="h-full">
      <body
        className={`${inter.className} min-h-full bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={200}>
            <PwaRegister />
            <PrintThemeHandler />
            <div className="flex min-h-screen flex-col md:flex-row">
              <MobileNav listData={listData} timetableUrl={schoolConfig.timetableUrl} />
              <Sidebar listData={listData} timetableUrl={schoolConfig.timetableUrl} />
              <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-6 overflow-x-hidden">
                {children}
              </main>
            </div>
            <SearchCommand listData={listData} />
            <PwaInstructionsModal />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
