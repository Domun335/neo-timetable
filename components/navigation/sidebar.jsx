'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Search, GraduationCap, Users, DoorOpen, ExternalLink } from 'lucide-react'
import { schoolConfig } from '@/school.config'
import { EntityList } from './entity-list'
import { FavoritesList } from './favorites-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { PrintButton } from '@/components/print-button'
import { PwaInstallButton } from '@/components/pwa-install-button'
import { useSearchModal } from '@/hooks/use-search-modal'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'

export function Sidebar({ listData, timetableUrl }) {
  const params = useParams()
  const currentType = params?.type || 'o'
  const [activeTab, setActiveTab] = useState(
    currentType === 'n' ? 'teachers' : currentType === 's' ? 'rooms' : 'classes',
  )
  const { openSearch } = useSearchModal()

  return (
    <aside className="no-print hidden md:flex flex-col w-72 lg:w-80 h-screen sticky top-0 border-r border-border/70 bg-card/50 backdrop-blur-xl shrink-0 z-30 transition-all overflow-hidden">
      <div className="p-4 border-b border-border/60 shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative size-10 rounded-xl overflow-hidden shadow-xs ring-1 ring-border/50 group-hover:scale-105 transition-transform">
            <Image
              src={schoolConfig.branding.logo || '/logo.svg'}
              alt={schoolConfig.shortName}
              width={40}
              height={40}
              className="size-full object-contain"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
              <span>{schoolConfig.shortName}</span>
              <Badge
                variant="secondary"
                className="text-[10px] font-medium px-1.5 py-0 h-4.5 bg-primary/10 text-primary border-primary/20"
              >
                Plan Lekcji
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground truncate">{schoolConfig.name}</div>
          </div>
        </Link>

        <Button
          type="button"
          variant="outline"
          onClick={openSearch}
          className="mt-3 flex w-full h-9 items-center justify-between gap-2 rounded-xl border-border/80 bg-muted/40 hover:bg-muted/70 px-3 text-xs text-muted-foreground transition-all shadow-xs group font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="truncate">Szukaj klasy, sali, nauczyciela...</span>
          </div>
          <Kbd className="hidden lg:inline-flex rounded-md border border-border/80 bg-background/80 px-1.5 text-[10px]">
            Ctrl+K
          </Kbd>
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-3">
        <div className="shrink-0">
          <FavoritesList />
        </div>

        <div className="shrink-0 mb-2.5">
          <PwaInstallButton variant="banner" />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col gap-0"
        >
          <TabsList className="grid grid-cols-[1fr_1.35fr_1fr] gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 mb-2.5 shrink-0 text-xs w-full !h-auto group-data-horizontal/tabs:!h-auto">
            <TabsTrigger
              value="classes"
              className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs h-auto"
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
              className="flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs h-auto"
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
                placeholder="Filtruj klasy (np. 5T_A, 4TA)..."
              />
            </TabsContent>
            <TabsContent
              value="teachers"
              className="flex-1 min-h-0 h-full mt-0 overflow-hidden flex flex-col"
            >
              <EntityList
                items={listData?.teachers || []}
                type="n"
                placeholder="Filtruj nauczycieli..."
              />
            </TabsContent>
            <TabsContent
              value="rooms"
              className="flex-1 min-h-0 h-full mt-0 overflow-hidden flex flex-col"
            >
              <EntityList
                items={listData?.rooms || []}
                type="s"
                placeholder="Filtruj sale (np. 10, W9)..."
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <PrintButton />
          <PwaInstallButton />
        </div>

        <div className="flex items-center gap-2">
          {timetableUrl && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={timetableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  />
                }
              >
                <span>Optivum</span>
                <ExternalLink className="size-3" />
              </TooltipTrigger>
              <TooltipContent>Oryginalny plan lekcji VULCAN Optivum</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href="https://github.com/Domun335"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                />
              }
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>by Domuno</span>
            </TooltipTrigger>
            <TooltipContent>Autor &bull; Dominik Zwoliński</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  )
}
