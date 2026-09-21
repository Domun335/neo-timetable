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
  const { type, id, title, hours, availableGroups, subjectGroups = [] } = timetable
  const { isFavorite, toggleFavorite } = useFavorites()
  const { saveLastPath } = useLastPath()
  const currentInfo = useCurrentLesson(hours)

  const {
    selectedGroups,
    setSelectedGroups,
    setBaseGroup,
    setSubjectGroup,
    clearSubjectOverride,
    resetAllOverrides,
  } = useGroupPreferences(type, id)

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
    <div className="flex flex-col gap-3 sm:gap-5 w-full max-w-[1600px] mx-auto p-3 sm:p-6 lg:p-8 print:p-0 print:max-w-none print:gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60 print:pb-2 print:border-b-2 print:border-foreground/20">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs print:size-9 print:rounded-lg">
            <TypeIcon className="size-5 sm:size-6 print:size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate print:text-lg">
                {title}
              </h1>

              <div className="no-print shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => toggleFavorite({ type, id, name: title })}
                        className="size-8 sm:size-8.5 rounded-xl border-border/60 bg-card hover:bg-muted text-muted-foreground transition-all hover:scale-105 active:scale-95 shadow-2xs"
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

            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground print:text-foreground/70">
              <span className="font-semibold text-foreground/85 print:text-foreground">
                {typeLabel}
              </span>
              <span>&bull;</span>
              <span className="truncate">{schoolConfig.semester ?? 'Semestr bieżący'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print self-start sm:self-auto">
          <CurrentLessonBadge hours={hours} currentInfo={currentInfo} />
        </div>
      </div>

      {type === 'o' && (
        (subjectGroups?.length || 0) > 0 ||
        Math.max(
          0,
          ...(availableGroups?.general || []),
          ...(availableGroups?.lang || []),
          ...(availableGroups?.wf || []),
        ) >= 2
      ) && (
        <div className="no-print">
          <GroupFilter
            availableGroups={availableGroups}
            subjectGroups={subjectGroups}
            selectedGroups={selectedGroups}
            onChangeGroups={setSelectedGroups}
            onSetBaseGroup={setBaseGroup}
            onSetSubjectGroup={setSubjectGroup}
            onClearSubjectOverride={clearSubjectOverride}
            onResetAllOverrides={resetAllOverrides}
          />
        </div>
      )}

      <div className="hidden md:block print:!block timetable-desktop-view">
        <TimetableTable
          timetable={timetable}
          selectedGroups={selectedGroups}
          currentInfo={currentInfo}
          onSetSubjectGroup={type === 'o' ? setSubjectGroup : null}
        />
      </div>

      <div className="block md:hidden print:!hidden timetable-mobile-view">
        <TimetableList
          timetable={timetable}
          selectedGroups={selectedGroups}
          currentInfo={currentInfo}
          onSetSubjectGroup={type === 'o' ? setSubjectGroup : null}
        />
      </div>
    </div>
  )
}
