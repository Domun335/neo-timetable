'use client'

import { useOffline } from 'next/offline'
import { WifiOff } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TimetableLoading() {
  const isOffline = useOffline()

  if (isOffline) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
            <WifiOff className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              Brak połączenia z internetem
            </h2>
            <p className="text-sm text-muted-foreground">
              Plan lekcji zostanie załadowany automatycznie po przywróceniu połączenia.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-8 w-44 rounded-full hidden sm:block" />
      </div>

      <Skeleton className="h-12 w-full rounded-2xl" />

      <div className="rounded-2xl border border-border/60 p-4 space-y-3 bg-card/40">
        <div className="grid grid-cols-6 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-lg" />
          ))}
        </div>

        {[...Array(7)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 py-2">
            {[...Array(6)].map((_, j) => (
              <Skeleton key={j} className="h-16 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
