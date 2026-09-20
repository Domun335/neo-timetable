import { Skeleton } from '@/components/ui/skeleton'

export default function TimetableLoading() {
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
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>

        {[...Array(7)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 py-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
