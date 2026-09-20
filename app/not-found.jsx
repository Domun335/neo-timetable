import Link from 'next/link'
import { CalendarX, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <CalendarX className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            Nie znaleziono planu
          </h2>
          <p className="text-sm text-muted-foreground">
            Wybrany oddział, nauczyciel lub sala nie istnieje w aktualnym rozkładzie zajęć.
          </p>
        </div>

        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Wróć do strony głównej</span>
        </Link>
      </div>
    </div>
  )
}
