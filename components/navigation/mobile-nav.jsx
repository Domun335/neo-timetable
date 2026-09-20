'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Menu, Search, GraduationCap, Users, DoorOpen, ExternalLink } from 'lucide-react'
import { schoolConfig } from '@/school.config'
import { EntityList } from './entity-list'
import { FavoritesList } from './favorites-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { PrintButton } from '@/components/print-button'
import { PwaInstallButton } from '@/components/pwa-install-button'
import { useSearchModal } from '@/hooks/use-search-modal'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export function MobileNav({ listData, timetableUrl }) {
  const params = useParams()
  const currentType = params?.type || 'o'
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(
    currentType === 'n' ? 'teachers' : currentType === 's' ? 'rooms' : 'classes',
  )
  const { openSearch } = useSearchModal()

  return (
    <>
      <header className="no-print md:hidden sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl border-border/60 bg-muted/40 text-foreground hover:bg-muted"
                  aria-label="Otwórz menu nawigacji"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[85%] max-w-xs p-4 flex flex-col gap-0 h-full overflow-hidden"
            >
              <SheetHeader className="p-0 pb-3 border-b border-border/60 shrink-0">
                <SheetTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Image
                    src={schoolConfig.branding.logo || '/logo.svg'}
                    alt={schoolConfig.shortName}
                    width={28}
                    height={28}
                    className="rounded-md"
                  />
                  <span>{schoolConfig.shortName}</span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menu nawigacji mobilnej NeoPlan
                </SheetDescription>
              </SheetHeader>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  openSearch()
                }}
                className="mt-3 flex w-full h-9 items-center justify-start gap-2.5 rounded-xl border-border/70 bg-muted/40 px-3 text-xs text-muted-foreground font-normal hover:bg-muted shrink-0"
              >
                <Search className="size-4" />
                <span>Szukaj klasy, sali, nauczyciela...</span>
              </Button>

              <div className="mt-3 shrink-0">
                <FavoritesList />
              </div>

              <div className="shrink-0 mt-2">
                <PwaInstallButton variant="banner" />
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 min-h-0 overflow-hidden flex flex-col my-2 gap-0"
              >
                <TabsList className="grid grid-cols-[1fr_1.35fr_1fr] gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 mb-2 shrink-0 text-xs w-full !h-auto group-data-horizontal/tabs:!h-auto">
                  <TabsTrigger
                    value="classes"
                    className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs h-auto"
                  >
                    <GraduationCap className="size-3.5 shrink-0" />
                    <span>Klasy</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="teachers"
                    className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs h-auto"
                  >
                    <Users className="size-3.5 shrink-0" />
                    <span className="truncate">Nauczyciele</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="rooms"
                    className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs h-auto"
                  >
                    <DoorOpen className="size-3.5 shrink-0" />
                    <span>Sale</span>
                  </TabsTrigger>
                </TabsList>

                <div
                  className="flex-1 min-h-0 overflow-hidden flex flex-col"
                  onClick={() => setIsOpen(false)}
                >
                  <TabsContent
                    value="classes"
                    className="flex-1 min-h-0 h-full mt-0 overflow-hidden flex flex-col"
                  >
                    <EntityList
                      items={listData?.classes || []}
                      type="o"
                      placeholder="Szukaj klasy..."
                    />
                  </TabsContent>
                  <TabsContent
                    value="teachers"
                    className="flex-1 min-h-0 h-full mt-0 overflow-hidden flex flex-col"
                  >
                    <EntityList
                      items={listData?.teachers || []}
                      type="n"
                      placeholder="Szukaj nauczyciela..."
                    />
                  </TabsContent>
                  <TabsContent
                    value="rooms"
                    className="flex-1 min-h-0 h-full mt-0 overflow-hidden flex flex-col"
                  >
                    <EntityList
                      items={listData?.rooms || []}
                      type="s"
                      placeholder="Szukaj sali..."
                    />
                  </TabsContent>
                </div>
              </Tabs>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground mt-auto shrink-0">
                {timetableUrl && (
                  <a
                    href={timetableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <span>Optivum</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
                <a
                  href="https://github.com/Domun335"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                >
                  <svg
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>by Dominik Zwoliński</span>
                </a>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg overflow-hidden ring-1 ring-border/50">
              <Image
                src={schoolConfig.branding.logo || '/logo.svg'}
                alt={schoolConfig.shortName}
                width={32}
                height={32}
                className="size-full object-contain"
              />
            </div>
            <span className="font-bold text-sm text-foreground">{schoolConfig.shortName}</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={openSearch}
            className="size-9 rounded-xl border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Szukaj w planie"
          >
            <Search className="size-4" />
          </Button>
          <PwaInstallButton />
          <ThemeToggle />
          <PrintButton />
        </div>
      </header>
    </>
  )
}
