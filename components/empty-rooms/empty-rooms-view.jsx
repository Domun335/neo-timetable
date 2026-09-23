'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { DoorOpen, Search, Check, CalendarDays, X, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { timeToMinutes } from '@/hooks/use-current-lesson'
import { cn } from '@/lib/utils'

export function EmptyRoomsView({ rooms = [], hours = [], dayNames = [] }) {
  const [mounted, setMounted] = useState(false)
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0)
  const [currentJsDay, setCurrentJsDay] = useState(1)

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const now = new Date()
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes())
      setCurrentJsDay(now.getDay())
    }
    updateTime()
    const timer = setInterval(updateTime, 30000)
    return () => clearInterval(timer)
  }, [])

  // Domyślny dzień: dzisiaj (jeśli pon-pt) lub poniedziałek (jeśli weekend)
  const initialDayIndex = useMemo(() => {
    const now = new Date()
    const jsDay = now.getDay()
    return jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : 0
  }, [])

  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex)
  const [searchQuery, setSearchQuery] = useState('')

  // Wykrywanie trwającej aktualnie lekcji lub przerwy
  const liveInfo = useMemo(() => {
    if (!mounted || hours.length === 0) return null

    const todayIndex = currentJsDay >= 1 && currentJsDay <= 5 ? currentJsDay - 1 : -1
    if (todayIndex === -1) {
      return { isSchoolDay: false, text: 'Weekend • Brak zajęć', currentLessonNumber: null }
    }

    for (let i = 0; i < hours.length; i++) {
      const h = hours[i]
      const startMin = timeToMinutes(h.timeFrom)
      const endMin = timeToMinutes(h.timeTo)

      if (currentTimeMinutes >= startMin && currentTimeMinutes <= endMin) {
        return {
          isSchoolDay: true,
          isLive: true,
          currentLessonNumber: h.number,
          text: `Trwa lekcja ${h.number} (${h.timeFrom} – ${h.timeTo})`,
        }
      }

      const prevHour = hours[i - 1]
      const prevEndMin = prevHour ? timeToMinutes(prevHour.timeTo) : null
      if (prevEndMin !== null && currentTimeMinutes > prevEndMin && currentTimeMinutes < startMin) {
        return {
          isSchoolDay: true,
          isLive: true,
          currentLessonNumber: h.number,
          text: `Przerwa przed lekcją ${h.number} (rozpoczęcie o ${h.timeFrom})`,
        }
      }
    }

    if (currentTimeMinutes < timeToMinutes(hours[0]?.timeFrom)) {
      return {
        isSchoolDay: true,
        isLive: false,
        currentLessonNumber: null,
        text: `Przed lekcjami • Początek o ${hours[0]?.timeFrom}`,
      }
    }

    return {
      isSchoolDay: true,
      isLive: false,
      currentLessonNumber: null,
      text: 'Po lekcjach',
    }
  }, [mounted, currentTimeMinutes, currentJsDay, hours])

  const isTodaySelected =
    mounted && currentJsDay >= 1 && currentJsDay <= 5 && currentJsDay - 1 === selectedDayIndex

  // Obliczenie liczby wolnych sal dla każdej godziny w wybranym dniu
  const hourFreeCounts = useMemo(() => {
    const counts = {}
    hours.forEach((h, hIdx) => {
      let free = 0
      for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].days[selectedDayIndex]?.slots?.[hIdx]?.isFree) {
          free++
        }
      }
      counts[h.number] = free
    })
    return counts
  }, [hours, rooms, selectedDayIndex])

  // Filtrowanie sal
  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return rooms.filter((room) => {
      if (query && !room.name.toLowerCase().includes(query)) {
        return false
      }

      return true
    })
  }, [rooms, searchQuery])

  return (
    <div className="space-y-5">
      {/* Nagłówek */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <DoorOpen className="size-7 text-primary" />
            <span>Wolne sale lekcyjne</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Siatka zajętości i wolnych pracowni w wybranym dniu tygodnia
          </p>
        </div>

        {/* Status na żywo */}
        {liveInfo && (
          <div className="flex items-center gap-2 bg-card/70 border border-border/70 rounded-2xl px-3 py-2 shadow-xs backdrop-blur-md self-start sm:self-auto text-xs">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {liveInfo.isLive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              )}
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2.5 w-2.5',
                  liveInfo.isLive ? 'bg-emerald-500' : 'bg-muted-foreground/50',
                )}
              />
            </span>
            <span className="font-medium text-foreground">{liveInfo.text}</span>
          </div>
        )}
      </div>

      {/* Dni tygodnia */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {dayNames.map((dayName, idx) => {
          const isDaySelected = idx === selectedDayIndex
          const isCurrentDay =
            mounted && currentJsDay >= 1 && currentJsDay <= 5 && currentJsDay - 1 === idx

          return (
            <button
              key={dayName}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0',
                isDaySelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70',
              )}
            >
              <CalendarDays className="size-3.5" />
              <span>{dayName}</span>
              {isCurrentDay && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal',
                    isDaySelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/15 text-primary',
                  )}
                >
                  Dziś
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Wyszukiwanie sali */}
      <div className="flex flex-row items-center justify-between gap-2 bg-card/60 border border-border/70 p-3 rounded-2xl backdrop-blur-md">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtruj salę..."
            className="pl-9 pr-8 h-9 text-xs rounded-xl bg-background/80"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground">
            Sale: <strong className="text-foreground">{filteredRooms.length}</strong> z{' '}
            {rooms.length}
          </span>
        </div>
      </div>

      {/* Tabela zajętości sal */}
      <div className="w-full overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-left min-w-180 text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40">
                <th className="sm:sticky left-0 z-20 bg-card/95 backdrop-blur-sm p-3 font-bold text-foreground min-w-[110px] max-w-35 border-r border-border/60">
                  <div className="flex items-center gap-1.5">
                    <DoorOpen className="size-4 text-primary" />
                    <span>Sala</span>
                  </div>
                </th>
                {hours.map((hour) => {
                  const isCurrent = isTodaySelected && liveInfo?.currentLessonNumber === hour.number
                  const freeCount = hourFreeCounts[hour.number] ?? 0

                  return (
                    <th
                      key={hour.number}
                      className={cn(
                        'p-2.5 text-center transition-colors border-r border-border/40 last:border-r-0 min-w-[85px]',
                        isCurrent && 'bg-primary/10 border-b-2 border-primary',
                      )}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              isCurrent ? 'text-primary font-bold' : 'text-foreground',
                            )}
                          >
                            Lekcja {hour.number}
                          </span>
                          {isCurrent && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                          {hour.timeFrom} - {hour.timeTo}
                        </span>
                        <span
                          className={cn(
                            'text-[9px] px-1.5 py-0.2 rounded-full font-semibold mt-0.5',
                            freeCount > 0
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {freeCount} wolnych
                        </span>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={hours.length + 1} className="p-8 text-center text-muted-foreground">
                    Brak sal spełniających kryteria wyszukiwania.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const dayData = room.days[selectedDayIndex]
                  const slots = dayData?.slots || []

                  return (
                    <tr key={room.id} className="hover:bg-muted/20 transition-colors">
                      <td className="sm:sticky left-0 z-10 bg-card/95 backdrop-blur-sm p-2.5 font-semibold text-foreground border-r border-border/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <Link
                          href={`/s/${room.id}`}
                          className="group flex items-center justify-between gap-1.5 hover:text-primary transition-colors"
                          title={`Zobacz pełny plan sali ${room.name}`}
                        >
                          <span className="truncate">Sala {room.name}</span>
                          <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      </td>
                      {hours.map((hour, idx) => {
                        const slot = slots[idx]
                        const isCurrent =
                          isTodaySelected && liveInfo?.currentLessonNumber === hour.number
                        const isFree = slot?.isFree ?? true
                        const lessons = slot?.lessons || []

                        return (
                          <td
                            key={hour.number}
                            className={cn(
                              'p-1.5 text-center align-middle border-r border-border/40 last:border-r-0 transition-colors',
                              isCurrent && 'bg-primary/5',
                              isFree ? 'hover:bg-emerald-500/10' : 'hover:bg-muted/30',
                            )}
                          >
                            {isFree ? (
                              <div className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Check className="size-3 stroke-[2.5]" />
                                <span>Wolna</span>
                              </div>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <div className="inline-flex flex-col items-center justify-center max-w-[95px] w-full px-1.5 py-1 rounded bg-muted/60 text-muted-foreground text-[10px] truncate leading-tight border border-border/40" />
                                  }
                                >
                                  <span className="font-semibold text-foreground truncate w-full text-center">
                                    {lessons[0]?.className || 'Zajęta'}
                                  </span>
                                  {lessons[0]?.subject && (
                                    <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                                      {lessons[0].subject}
                                    </span>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs space-y-1.5 p-2">
                                  {lessons.map((l, lIdx) => (
                                    <div key={lIdx} className="space-y-0.5">
                                      <div className="font-bold text-background leading-snug">
                                        {l.subject || 'Lekcja'}
                                        {l.groupName && (
                                          <span className="ml-1 text-[10px] text-background/70 font-normal">
                                            ({l.groupName})
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-background/80 text-[11px] leading-snug">
                                        {l.className && (
                                          <Link
                                            href={`/o/${l.classId || '1'}`}
                                            className="text-background font-semibold underline underline-offset-2 hover:opacity-85"
                                          >
                                            Klasa {l.className}
                                          </Link>
                                        )}
                                        {l.teacher && (
                                          <span className="ml-1.5">
                                            (
                                            <Link
                                              href={`/n/${l.teacherId || '1'}`}
                                              className="text-background/90 hover:underline"
                                            >
                                              {l.teacherName || l.teacher}
                                            </Link>
                                            )
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
