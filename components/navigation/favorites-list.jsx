'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { GraduationCap, User, DoorOpen, Star } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Lista ulubionych jednostek (klasy, nauczyciele, sale) zapisanych przez użytkownika
 */
export function FavoritesList() {
  const params = useParams()
  const currentType = params?.type
  const currentId = params?.id
  const { favorites, isLoaded, toggleFavorite } = useFavorites()

  if (!isLoaded || favorites.length === 0) return null

  const getIcon = (type) => {
    if (type === 'o') return GraduationCap
    if (type === 'n') return User
    if (type === 's') return DoorOpen
    return Star
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-2 mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          Ulubione ({favorites.length})
        </span>
      </div>

      <div className="space-y-1 pr-2">
        {favorites.map((fav) => {
          const Icon = getIcon(fav.type)
          const isActive = currentType === fav.type && String(currentId) === String(fav.id)

          return (
            <div
              key={`${fav.type}-${fav.id}`}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3 py-2 sm:py-1.5 text-sm sm:text-xs transition-all active:scale-[0.99]',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-foreground/85 hover:bg-muted/70 hover:text-foreground active:bg-muted',
              )}
            >
              <Link
                href={`/${fav.type}/${fav.id}`}
                className="flex items-center gap-2.5 flex-1 truncate py-0.5"
                title={fav.name}
              >
                <div
                  className={cn(
                    'p-1 rounded-lg',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                </div>
                <span className="truncate font-medium">{fav.name}</span>
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
                        toggleFavorite(fav)
                      }}
                      className="size-8 sm:size-6 p-0 text-amber-400 hover:text-amber-500 opacity-90 hover:opacity-100 hover:bg-transparent shrink-0"
                      aria-label="Usuń z ulubionych"
                    />
                  }
                >
                  <Star className="size-3.5 fill-current" />
                </TooltipTrigger>
                <TooltipContent>Usuń z ulubionych</TooltipContent>
              </Tooltip>
            </div>
          )
        })}
      </div>
    </div>
  )
}
