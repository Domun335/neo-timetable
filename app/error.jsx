'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Błąd wykonania aplikacji:', error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            Wystąpił problem z wczytaniem danych
          </h2>
          <p className="text-sm text-muted-foreground">
            Nie udało się pobrać aktualnego planu lekcji ze źródła szkoły. Sprawdź połączenie z
            internetem lub spróbuj ponownie.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Spróbuj ponownie</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Strona główna</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
