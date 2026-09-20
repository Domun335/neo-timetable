'use client'

import { useEffect } from 'react'
import { Star, GraduationCap, User, DoorOpen } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { schoolConfig } from '@/school.config'
import { TimetableTable } from './timetable-table'
import { TimetableList } from './timetable-list'
import { CurrentLessonBadge } from './current-lesson'
import { GroupFilter } from './group-filter'
import { useFavorites } from '@/hooks/use-favorites'
import { useLastPath } from '@/hooks/use-last-path'
import { useCurrentLesson } from '@/hooks/use-current-lesson'
import { useGroupPreferences } from '@/hooks/use-group-preferences'

export function TimetableView({ timetable }) {
  const { type, id, title, hours, availableGroups } = timetable
  const { isFavorite, toggleFavorite } = useFavorites()
  const { saveLastPath } = useLastPath()
  const currentInfo = useCurrentLesson(hours)

  const { selectedGroups, setSelectedGroups, hideFiltered, toggleHideFiltered } =
    useGroupPreferences(type, id)

  useEffect(() => {
    saveLastPath(`/${type}/${id}`)
  }, [type, id, saveLastPath])

  const fav = isFavorite(type, id)

  const getTypeInfo = () => {
    if (type === 'o') return { label: 'Klasa', icon: GraduationCap }
    if (type === 'n') return { label: 'Nauczyciel', icon: User }
    if (type === 's') return { label: 'Sala', icon: DoorOpen }
    return { label: 'Plan', icon: GraduationCap }
  }

  const { label: typeLabel, icon: TypeIcon } = getTypeInfo()

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-none print:gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60 print:pb-2 print:border-b-2 print:border-foreground/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs print:h-9 print:w-9 print:rounded-lg">
            <TypeIcon className="h-6 w-6 print:h-5 print:w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground print:text-lg">
                {title}
              </h1>

              <div className="no-print">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => toggleFavorite({ type, id, name: title })}
                        className="rounded-xl border-border/60 bg-card hover:bg-muted text-muted-foreground transition-all hover:scale-105 active:scale-95"
                        aria-label="Przełącz ulubione"
                      />
                    }
                  >
                    <Star
                      className={`size-4 ${
                        fav
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground print:text-foreground/70">
              <span className="font-medium text-foreground/80 print:text-foreground">
                {typeLabel}
              </span>
              <span>&bull;</span>
              <span>{schoolConfig.semester ?? 'Semestr bieżący'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <CurrentLessonBadge hours={hours} currentInfo={currentInfo} />
        </div>
      </div>

      {type === 'o' && availableGroups && (
        <div className="no-print p-3 rounded-2xl bg-muted/40 border border-border/60">
          <GroupFilter
            availableGroups={availableGroups}
            selectedGroups={selectedGroups}
            onChangeGroups={setSelectedGroups}
            hideFiltered={hideFiltered}
            onToggleHideFiltered={toggleHideFiltered}
          />
        </div>
      )}

      <div className="hidden md:block print:!block timetable-desktop-view">
        <TimetableTable
          timetable={timetable}
          selectedGroups={selectedGroups}
          currentInfo={currentInfo}
          hideFiltered={hideFiltered}
        />
      </div>

      <div className="block md:hidden print:!hidden timetable-mobile-view">
        <TimetableList
          timetable={timetable}
          selectedGroups={selectedGroups}
          currentInfo={currentInfo}
          hideFiltered={hideFiltered}
        />
      </div>
    </div>
  )
}
