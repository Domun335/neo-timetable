'use client'

import { useOffline } from 'next/offline'
import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-online-status'

export function OfflineBanner() {
  const nextOffline = useOffline()
  const isOnline = useOnlineStatus()
  const isOffline = nextOffline || !isOnline

  if (!isOffline) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-amber-500/90 text-amber-950 px-4 py-2 text-xs sm:text-sm font-semibold border-b border-amber-600/20 shadow-xs no-print shrink-0"
    >
      <WifiOff className="size-3.5 sm:size-4 shrink-0" />
      <span>Brak połączenia</span>
    </div>
  )
}
