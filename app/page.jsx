'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { schoolConfig } from '@/school.config'
import { useLastPath } from '@/hooks/use-last-path'
import { useFavorites } from '@/hooks/use-favorites'

export default function HomePage() {
  const router = useRouter()
  const { getLastPath } = useLastPath()
  const { favorites, isLoaded } = useFavorites()

  useEffect(() => {
    if (!isLoaded) return

    // 1. Sprawdzamy ostatnio przeglądany plan
    const lastPath = getLastPath()
    if (typeof lastPath === 'string' && /^\/(o|n|s)\/\d+$/.test(lastPath)) {
      router.replace(lastPath)
      return
    }

    // 2. Sprawdzamy czy są ulubione
    if (favorites && favorites.length > 0) {
      const firstFav = favorites[0]
      if (['o', 'n', 's'].includes(firstFav?.type) && /^\d+$/.test(String(firstFav?.id))) {
        router.replace(`/${firstFav.type}/${firstFav.id}`)
        return
      }
    }

    // 3. Fallback do pierwszej klasy
    router.replace('/o/1')
  }, [isLoaded, getLastPath, favorites, router])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-primary/20 animate-pulse">
          <Image
            src={schoolConfig.branding.logo || '/logo.svg'}
            alt={schoolConfig.shortName}
            width={64}
            height={64}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{schoolConfig.shortName}</h2>
          <p className="text-xs text-muted-foreground">Ładowanie planu lekcji...</p>
        </div>
      </div>
    </div>
  )
}
