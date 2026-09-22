'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  Search,
  GraduationCap,
  Users,
  DoorOpen,
  CalendarDays,
  Star,
  LayoutGrid,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react'
import { schoolConfig } from '@/school.config'
import { EntityList } from './entity-list'
import { FavoritesList } from './favorites-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { PwaInstallButton } from '@/components/pwa-install-button'
import { useSearchModal } from '@/hooks/use-search-modal'
import { useFavorites } from '@/hooks/use-favorites'
import { useLastPath } from '@/hooks/use-last-path'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function MobileNav({ listData, timetableUrl }) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentType = params?.type || 'o'
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(
    currentType === 'n' ? 'teachers' : currentType === 's' ? 'rooms' : 'classes',
  )

  const { openSearch } = useSearchModal()
  const { favorites, isLoaded } = useFavorites()
  const { getLastPath } = useLastPath()

  const isTimetableActive = Boolean(params?.type && params?.id)
  const favCount = isLoaded ? favorites?.length || 0 : 0

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setIsDrawerOpen(false)
    setIsFavoritesOpen(false)
  }

  const handlePlanClick = useCallback(() => {
    if (isTimetableActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const last = getLastPath()
      if (typeof last === 'string' && /^\/(o|n|s)\/\d+$/.test(last)) {
        router.push(last)
      } else if (favorites && favorites.length > 0 && ['o', 'n', 's'].includes(favorites[0]?.type)) {
        router.push(`/${favorites[0].type}/${favorites[0].id}`)
      } else {
        const firstClassId = listData?.classes?.[0]?.value || '1'
        router.push(`/o/${firstClassId}`)
      }
    }
  }, [isTimetableActive, getLastPath, favorites, listData, router])

  return (
    <>
      <header className="no-print md:hidden sticky top-0 z-30 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl px-3.5 py-2.5 flex items-center justify-between transition-all shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 min-w-0 group active:scale-98 transition-transform"
          >
            <div className="size-8 shrink-0 rounded-xl overflow-hidden ring-1 ring-border/50 bg-muted/40 p-0.5 shadow-2xs">
              <Image
                src={schoolConfig.branding.logo || '/logo.svg'}
                alt={schoolConfig.shortName}
                width={32}
                height={32}
                className="size-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground tracking-tight leading-tight truncate">
                {schoolConfig.shortName}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {schoolConfig.semester || 'Plan lekcji'}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={openSearch}
            className="size-8.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all"
            aria-label="Szukaj w planie"
          >
            <Search className="size-4" />
          </Button>

          <ThemeToggle />

          <PwaInstallButton />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsDrawerOpen(true)}
            className="size-8.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all"
            aria-label="Otwórz katalog i menu"
          >
            <Menu className="size-4.5" />
          </Button>
        </div>
      </header>

      <nav
        aria-label="Nawigacja mobilna"
        className="no-print md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl pb-safe shadow-lg transition-all"
      >
        <div className="grid grid-cols-4 h-14 items-center px-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={handlePlanClick}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all active:scale-95',
              isTimetableActive
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground font-medium',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center size-7 rounded-lg transition-all',
                isTimetableActive && 'bg-primary/10 text-primary',
              )}
            >
              <CalendarDays className="size-4.5" />
            </div>
            <span className="text-[10px] tracking-tight">Plan</span>
          </button>

          <button
            type="button"
            onClick={openSearch}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-muted-foreground hover:text-foreground font-medium transition-all active:scale-95"
          >
            <div className="flex items-center justify-center size-7 rounded-lg">
              <Search className="size-4.5" />
            </div>
            <span className="text-[10px] tracking-tight">Szukaj</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFavoritesOpen(true)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all active:scale-95',
              favCount > 0 ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <div className="relative flex items-center justify-center size-7 rounded-lg">
              <Star
                className={cn(
                  'size-4.5',
                  favCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground',
                )}
              />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-2xs">
                  {favCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Ulubione</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-muted-foreground hover:text-foreground font-medium transition-all active:scale-95"
          >
            <div className="flex items-center justify-center size-7 rounded-lg">
              <LayoutGrid className="size-4.5" />
            </div>
            <span className="text-[10px] tracking-tight">Katalog</span>
          </button>
        </div>
      </nav>

      <Sheet open={isFavoritesOpen} onOpenChange={setIsFavoritesOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/80 max-h-[80vh] p-4 flex flex-col gap-3"
        >
          <div className="w-12 h-1 rounded-full bg-muted-foreground/30 mx-auto -mt-1 mb-1 shrink-0" />
          <SheetHeader className="p-0 pb-2 border-b border-border/50 text-left shrink-0 pr-8">
            <SheetTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Star className="size-4.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>Twoje Ulubione Plany</span>
              {favCount > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-md font-mono shrink-0">
                  {favCount}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Szybki dostęp do zapisanych klas, nauczycieli i sal
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-1 min-h-[120px]">
            {favCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4 space-y-3">
                <div className="size-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-500">
                  <Star className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Brak ulubionych planów</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Kliknij ikonę gwiazdki obok nazwy dowolnej klasy, nauczyciela lub sali, aby dodać ją do szybkiego wyboru.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsFavoritesOpen(false)
                    setIsDrawerOpen(true)
                  }}
                  className="rounded-xl text-xs gap-1.5 mt-2"
                >
                  <LayoutGrid className="size-3.5" />
                  Przeglądaj katalog
                </Button>
              </div>
            ) : (
              <FavoritesList />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="left"
          className="w-[88%] max-w-xs p-4 flex flex-col gap-0 h-full overflow-hidden"
        >
          <SheetHeader className="p-0 pb-3 border-b border-border/60 shrink-0">
            <SheetTitle className="flex items-center gap-2.5 text-sm font-bold text-foreground">
              <div className="size-7 rounded-lg overflow-hidden ring-1 ring-border/50 bg-muted/40 p-0.5">
                <Image
                  src={schoolConfig.branding.logo || '/logo.svg'}
                  alt={schoolConfig.shortName}
                  width={28}
                  height={28}
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">{schoolConfig.shortName}</span>
                <span className="text-[10px] font-normal text-muted-foreground">Katalog planów lekcji</span>
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Katalog klas, nauczycieli i sal lekcyjnych
            </SheetDescription>
          </SheetHeader>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsDrawerOpen(false)
              openSearch()
            }}
            className="mt-3 flex w-full h-9.5 items-center justify-start gap-2.5 rounded-xl border-border/70 bg-muted/40 px-3 text-xs text-muted-foreground font-normal hover:bg-muted shrink-0 active:scale-98 transition-all"
          >
            <Search className="size-4 text-primary" />
            <span className="truncate">Szukaj klasy, sali, nauczyciela...</span>
          </Button>

          <div className="shrink-0 mt-2.5">
            <PwaInstallButton variant="banner" />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 min-h-0 overflow-hidden flex flex-col mt-3 gap-0"
          >
            <TabsList className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 mb-2 shrink-0 text-xs w-full !h-auto">
              <TabsTrigger
                value="classes"
                className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs h-auto"
              >
                <GraduationCap className="size-3.5 shrink-0" />
                <span>Klasy</span>
              </TabsTrigger>
              <TabsTrigger
                value="teachers"
                className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs h-auto"
              >
                <Users className="size-3.5 shrink-0" />
                <span className="truncate">Nauczyciele</span>
              </TabsTrigger>
              <TabsTrigger
                value="rooms"
                className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs h-auto"
              >
                <DoorOpen className="size-3.5 shrink-0" />
                <span>Sale</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <TabsContent
                value="classes"
                className="flex-1 min-h-0 h-full mt-0 overflow-hidden flex flex-col"
              >
                <EntityList
                  items={listData?.classes || []}
                  type="o"
                />
              </TabsContent>
              <TabsContent
                value="teachers"
                className="flex-1 min-h-0 h-full mt-0 overflow-hidden flex flex-col"
              >
                <EntityList
                  items={listData?.teachers || []}
                  type="n"
                />
              </TabsContent>
              <TabsContent
                value="rooms"
                className="flex-1 min-h-0 h-full mt-0 overflow-hidden flex flex-col"
              >
                <EntityList
                  items={listData?.rooms || []}
                  type="s"
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground mt-auto shrink-0">
            <div className="flex items-center gap-3">
              {timetableUrl && (
                <a
                  href={timetableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors py-1"
                >
                  <span>Optivum</span>
                  <ExternalLink className="size-3" />
                </a>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsDrawerOpen(false)
                  setTimeout(() => window.print(), 300)
                }}
                className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
                aria-label="Drukuj plan lekcji"
                title="Drukuj plan lekcji"
              >
                <Printer className="size-3.5" />
              </Button>
            </div>

            <a
              href="https://github.com/Domun335"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto py-1"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>by Dominik</span>
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
