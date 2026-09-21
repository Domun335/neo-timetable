'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Star } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { cn } from '@/lib/utils'

export function EntityList({ items = [], type }) {
  const params = useParams()
  const currentType = params?.type
  const currentId = params?.id
  const { isFavorite, toggleFavorite } = useFavorites()

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ScrollArea className="flex-1 min-h-0 h-full">
        {items.length === 0 ? (
          <Empty className="py-6 border-none">
            <EmptyHeader>
              <EmptyTitle className="text-xs text-muted-foreground font-normal">
                Brak wyników
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-1 pb-2 pr-3">
            {items.map((item) => {
              const isActive = currentType === type && String(currentId) === String(item.value)
              const fav = isFavorite(type, item.value)

              return (
                <div
                  key={item.value}
                  className={cn(
                    'group flex items-center justify-between rounded-xl w-full px-3 py-2 sm:py-1.5 text-sm sm:text-xs transition-all active:scale-[0.99]',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-foreground/85 hover:bg-muted/70 hover:text-foreground active:bg-muted',
                  )}
                >
                  <Link
                    href={`/${type}/${item.value}`}
                    className="flex-1 truncate py-1 sm:py-0.5"
                    title={item.name}
                  >
                    <span className="truncate font-medium">{item.name}</span>
                  </Link>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite({ type, id: item.value, name: item.name })
                          }}
                          className={cn(
                            'size-7 sm:size-5 p-0 transition-opacity hover:bg-transparent shrink-0',
                            fav
                              ? 'opacity-100'
                              : 'opacity-40 sm:opacity-0 group-hover:opacity-100 hover:opacity-100',
                          )}
                          aria-label={fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                        />
                      }
                    >
                      <Star
                        className={cn(
                          'size-4 sm:size-3.5',
                          fav
                            ? isActive
                              ? 'fill-amber-300 text-amber-300'
                              : 'fill-amber-400 text-amber-400'
                            : isActive
                              ? 'text-primary-foreground/70 hover:text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground',
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
