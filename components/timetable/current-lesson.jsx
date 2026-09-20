'use client'

import { Clock, Bell, Coffee, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCurrentLesson } from '@/hooks/use-current-lesson'
import { cn } from '@/lib/utils'

export function CurrentLessonBadge({ hours, currentInfo: passedCurrentInfo }) {
  const hookCurrentInfo = useCurrentLesson(passedCurrentInfo ? null : hours)
  const currentInfo = passedCurrentInfo || hookCurrentInfo

  if (!currentInfo?.isMounted || !currentInfo?.badgeText) {
    return <div className="h-7" />
  }

  const getStatusConfig = () => {
    switch (currentInfo.status) {
      case 'in_lesson':
        return {
          icon: Clock,
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500 animate-pulse',
        }
      case 'break':
        return {
          icon: Coffee,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
        }
      case 'before_school':
        return {
          icon: Bell,
          color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          dot: 'bg-sky-500',
        }
      case 'after_school':
      default:
        return {
          icon: CheckCircle2,
          color: 'bg-muted text-muted-foreground border-border/60',
          dot: 'bg-muted-foreground/50',
        }
    }
  }

  const { icon: Icon, color, dot } = getStatusConfig()

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-auto cursor-default px-3 py-1.5 gap-2 rounded-full font-medium shadow-2xs transition-all',
        color,
      )}
    >
      <span className={cn('size-2 rounded-full shrink-0', dot)} />
      <Icon className="size-3.5 shrink-0" />
      <span className="font-semibold">{currentInfo.badgeText}</span>
    </Badge>
  )
}
