'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, User, DoorOpen, Star } from 'lucide-react'
import { normalizeSearchText, stripSearchSeparators } from '@/lib/search-utils'
import { useFavorites } from '@/hooks/use-favorites'
import { useSearchModal } from '@/hooks/use-search-modal'
import { schoolConfig } from '@/school.config'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'

export function SearchCommand({ listData, isOpen: propIsOpen, onClose: propOnClose }) {
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const modal = useSearchModal()

  const isOpen = propIsOpen !== undefined ? propIsOpen : modal.isOpen
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all') // 'all' | 'o' | 'n' | 's'

  const handleClose = useCallback(() => {
    setQuery('')
    setSelectedType('all')
    if (propOnClose) {
      propOnClose()
    } else {
      modal.closeSearch()
    }
  }, [propOnClose, modal])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === 'k' || e.code === 'KeyK')) {
        e.preventDefault()
        e.stopPropagation()
        if (propIsOpen !== undefined) {
          if (propIsOpen) {
            propOnClose?.()
          }
        } else {
          modal.toggleSearch()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [propIsOpen, propOnClose, modal])

  const allItems = useMemo(() => {
    if (!listData) return []

    return [
      ...(listData.classes || []).map((c) => ({
        type: 'o',
        id: c.value,
        name: c.name,
        category: 'Klasy',
        icon: GraduationCap,
        _searchKey: normalizeSearchText(c.name),
        _searchKeyClean: stripSearchSeparators(c.name),
      })),
      ...(listData.teachers || []).map((t) => ({
        type: 'n',
        id: t.value,
        name: t.name,
        fullName: t.fullName,
        shortName: t.shortName,
        category: 'Nauczyciele',
        icon: User,
        _searchKey: `${normalizeSearchText(t.name)} ${normalizeSearchText(t.fullName || '')} ${normalizeSearchText(t.shortName || '')}`,
        _searchKeyClean: `${stripSearchSeparators(t.name)} ${stripSearchSeparators(t.fullName || '')} ${stripSearchSeparators(t.shortName || '')}`,
      })),
      ...(listData.rooms || []).map((r) => ({
        type: 's',
        id: r.value,
        name: r.name,
        category: 'Sale',
        icon: DoorOpen,
        _searchKey: normalizeSearchText(r.name),
        _searchKeyClean: stripSearchSeparators(r.name),
      })),
    ]
  }, [listData])

  const filteredItems = useMemo(() => {
    if (!allItems.length) return []
    const normalizedQuery = normalizeSearchText(query)
    const cleanQuery = stripSearchSeparators(query)

    const typeFiltered =
      selectedType === 'all' ? allItems : allItems.filter((item) => item.type === selectedType)

    if (!normalizedQuery) {
      if (selectedType === 'all') {
        const favs = allItems.filter((item) => isFavorite(item.type, item.id))
        return favs.length > 0 ? favs.slice(0, 15) : allItems.slice(0, 20)
      }
      return typeFiltered.slice(0, 25)
    }

    return typeFiltered
      .filter((item) => {
        if (item._searchKey.includes(normalizedQuery)) return true
        if (cleanQuery && item._searchKeyClean && item._searchKeyClean.includes(cleanQuery)) {
          return true
        }
        return false
      })
      .slice(0, 30)
  }, [allItems, query, selectedType, isFavorite])

  const selectItem = (item) => {
    handleClose()
    router.push(`/${item.type}/${item.id}`)
  }

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
      title="Wyszukiwarka planu lekcji"
      description="Wyszukaj klasę, nauczyciela lub salę"
      className="border border-border/80 bg-card shadow-2xl rounded-2xl! max-sm:top-3 max-sm:max-w-[calc(100%-1rem)]"
    >
      <Command shouldFilter={false} className="rounded-2xl!">
        <CommandInput
          placeholder="Szukaj klasy, nauczyciela, sali..."
          value={query}
          onValueChange={setQuery}
          className="text-sm sm:text-base"
        />

        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/40 bg-muted/10 text-xs overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline shrink-0">
            Kategoria:
          </span>
          <ToggleGroup
            value={[selectedType]}
            onValueChange={(val) => {
              if (val[0]) setSelectedType(val[0])
            }}
            variant="outline"
            size="sm"
            className="gap-1 flex-nowrap shrink-0"
          >
            <ToggleGroupItem value="all" className="h-6.5 px-2 text-xs rounded-md shrink-0">
              Wszystko
            </ToggleGroupItem>
            <ToggleGroupItem value="o" className="h-6.5 px-2 text-xs rounded-md shrink-0">
              Klasy ({listData?.classes?.length || 0})
            </ToggleGroupItem>
            <ToggleGroupItem value="n" className="h-6.5 px-2 text-xs rounded-md shrink-0">
              Nauczyciele ({listData?.teachers?.length || 0})
            </ToggleGroupItem>
            <ToggleGroupItem value="s" className="h-6.5 px-2 text-xs rounded-md shrink-0">
              Sale ({listData?.rooms?.length || 0})
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <CommandList className="max-h-[60vh] sm:max-h-[50vh] p-2 divide-y divide-border/20">
          {filteredItems.length === 0 ? (
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
              {query ? (
                <>Nie znaleziono pozycji dla frazy &bdquo;{query}&rdquo;</>
              ) : (
                <>Brak pozycji do wyświetlenia.</>
              )}
            </CommandEmpty>
          ) : (
            <CommandGroup
              heading={!query && selectedType === 'all' ? 'Popularne i Ulubione' : undefined}
            >
              {filteredItems.map((item) => {
                const Icon = item.icon
                const fav = isFavorite(item.type, item.id)

                return (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    value={`${item.type}-${item.id}-${item.name}`}
                    onSelect={() => selectItem(item)}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4 shrink-0" />
                      </div>
                      <div className="truncate">
                        <span className="truncate font-medium">{item.name}</span>
                        {item.fullName && item.fullName !== item.name && (
                          <span className="ml-2 text-xs text-muted-foreground truncate">
                            ({item.shortName})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5 rounded-md font-mono"
                      >
                        {item.category}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(item)
                              }}
                              className="size-6 p-0 hover:bg-transparent"
                              aria-label={fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                            />
                          }
                        >
                          <Star
                            className={cn(
                              'size-4',
                              fav
                                ? 'fill-amber-400 text-amber-400'
                                : 'opacity-40 hover:opacity-100 text-muted-foreground',
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>

        <div className="hidden sm:flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground bg-muted/10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd className="h-4 px-1 text-[10px]">↑↓</Kbd> Nawigacja
            </span>
            <span className="flex items-center gap-1">
              <Kbd className="h-4 px-1 text-[10px]">↵</Kbd> Wybierz
            </span>
            <span className="flex items-center gap-1">
              <Kbd className="h-4 px-1 text-[10px]">ESC</Kbd> Zamknij
            </span>
          </div>
          <span>NeoPlan &bull; {schoolConfig.shortName}</span>
        </div>
      </Command>
    </CommandDialog>
  )
}
