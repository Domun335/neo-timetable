'use client'

import { useState } from 'react'
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Languages,
  Wrench,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export function GroupFilter({
  availableGroups = { general: [], lang: [], wf: [] },
  selectedGroups = { general: null, lang: null, wf: null },
  onChangeGroups,
  hideFiltered = true,
  onToggleHideFiltered,
}) {
  const [isDetailedOpen, setIsDetailedOpen] = useState(false)

  const hasAnyGroups =
    (availableGroups?.general?.length || 0) > 0 ||
    (availableGroups?.lang?.length || 0) > 0 ||
    (availableGroups?.wf?.length || 0) > 0

  if (!hasAnyGroups) return null

  const isAllSelected =
    selectedGroups.general === null && selectedGroups.lang === null && selectedGroups.wf === null

  const maxGroupNum = Math.max(
    2,
    ...(availableGroups?.general || []),
    ...(availableGroups?.lang || []),
    ...(availableGroups?.wf || []),
  )

  const groupNumbers = Array.from({ length: maxGroupNum }, (_, i) => i + 1)

  const toRoman = (num) => {
    const map = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' }
    return map[num] || String(num)
  }

  const isPresetActive = (num) => {
    const targetGeneral = availableGroups?.general?.includes(num) ? num : null
    const targetLang = availableGroups?.lang?.includes(num) ? num : null
    const targetWf = availableGroups?.wf?.includes(num) ? num : null

    return (
      selectedGroups.general === targetGeneral &&
      selectedGroups.lang === targetLang &&
      selectedGroups.wf === targetWf
    )
  }

  const isAnyPresetActive = groupNumbers.some((num) => isPresetActive(num))
  const isCustomized = !isAllSelected && !isAnyPresetActive

  const handlePreset = (num) => {
    if (num === null || isPresetActive(num)) {
      onChangeGroups({ general: null, lang: null, wf: null })
    } else {
      onChangeGroups({
        general: availableGroups?.general?.includes(num) ? num : null,
        lang: availableGroups?.lang?.includes(num) ? num : null,
        wf: availableGroups?.wf?.includes(num) ? num : null,
      })
    }
  }

  const handleCategoryChange = (category, num) => {
    onChangeGroups({
      ...selectedGroups,
      [category]: selectedGroups[category] === num ? null : num,
    })
  }

  const formatGroupLabel = (category, num) => {
    if (category === 'lang' || category === 'wf') {
      return `Gr ${num} (${toRoman(num)})`
    }
    return `Gr ${num}`
  }

  const activePresetValue = isAllSelected
    ? ['all']
    : isAnyPresetActive
      ? [String(groupNumbers.find((num) => isPresetActive(num)))]
      : []

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
            <Filter className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Grupa:</span>
          </div>

          <ToggleGroup
            value={activePresetValue}
            onValueChange={(val) => {
              const selected = val[0]
              if (!selected || selected === 'all') {
                handlePreset(null)
              } else {
                handlePreset(Number(selected))
              }
            }}
            variant="outline"
            size="sm"
            className="p-0.5 rounded-xl bg-muted/60 border border-border/60 gap-0.5"
          >
            <ToggleGroupItem value="all" className="px-2.5 py-1 text-xs font-medium h-7 rounded-lg">
              Wszystkie
            </ToggleGroupItem>
            {groupNumbers.map((num) => (
              <ToggleGroupItem
                key={num}
                value={String(num)}
                className="px-2.5 py-1 text-xs font-medium h-7 rounded-lg"
              >
                Gr {num}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {!isAllSelected && onToggleHideFiltered && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onToggleHideFiltered}
                    className={cn(
                      'rounded-xl text-xs font-medium h-7 gap-1.5 px-2.5 transition-all animate-in fade-in zoom-in-95 duration-150',
                      hideFiltered
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border/60 bg-card/60 text-muted-foreground hover:text-foreground',
                    )}
                    aria-label={
                      hideFiltered
                        ? 'Ukrywaj odfiltrowane lekcje'
                        : 'Przygaszaj odfiltrowane lekcje'
                    }
                  />
                }
              >
                {hideFiltered ? (
                  <EyeOff className="size-3.5 text-primary" />
                ) : (
                  <Eye className="size-3.5 text-muted-foreground" />
                )}
                <span className="hidden sm:inline">{hideFiltered ? 'Ukryte' : 'Przygaszone'}</span>
              </TooltipTrigger>
              <TooltipContent>
                {hideFiltered
                  ? 'Odfiltrowane lekcje są ukryte (kliknij, aby przygasić)'
                  : 'Odfiltrowane lekcje są przygaszone (kliknij, aby ukryć)'}
              </TooltipContent>
            </Tooltip>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDetailedOpen(!isDetailedOpen)}
            className={cn(
              'rounded-xl text-xs font-medium h-7 gap-1.5 px-2.5 transition-all',
              isDetailedOpen || isCustomized
                ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                : 'border-border/60 bg-card/60 text-muted-foreground hover:text-foreground',
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="text-[11px]">Dostosuj</span>
            {isCustomized && <span className="size-1.5 rounded-full bg-primary" />}
            {isDetailedOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </Button>
        </div>
      </div>

      <Collapsible open={isDetailedOpen} onOpenChange={setIsDetailedOpen}>
        <CollapsibleContent className="pt-2.5 pb-2 px-3 rounded-xl bg-card/90 border border-border/70 shadow-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-1 border-b border-border/40 text-[11px] text-muted-foreground font-medium">
            <span>Dostosuj grupy według przedmiotów:</span>
            {isCustomized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePreset(null)}
                className="h-auto p-0 text-[11px] text-primary hover:underline hover:bg-transparent"
              >
                <RotateCcw className="size-3 mr-1" />
                Resetuj
              </Button>
            )}
          </div>

          {availableGroups.general.length > 0 && (
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-[120px]">
                <Wrench className="size-3.5 text-sky-500" />
                <span className="font-medium">Zawodowe:</span>
              </div>
              <ToggleGroup
                value={selectedGroups.general === null ? ['all'] : [String(selectedGroups.general)]}
                onValueChange={(val) => {
                  const sel = val[0]
                  handleCategoryChange('general', !sel || sel === 'all' ? null : Number(sel))
                }}
                variant="outline"
                size="sm"
                className="p-0.5 rounded-lg bg-muted/40 border border-border/50 gap-0.5 flex-wrap"
              >
                <ToggleGroupItem value="all" className="px-2 py-0.5 text-[11px] h-6 rounded-md">
                  Wszystkie
                </ToggleGroupItem>
                {availableGroups.general.map((num) => (
                  <ToggleGroupItem
                    key={num}
                    value={String(num)}
                    className="px-2 py-0.5 text-[11px] h-6 rounded-md"
                  >
                    Gr {num}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {availableGroups.lang.length > 0 && (
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-[120px]">
                <Languages className="size-3.5 text-indigo-500" />
                <span className="font-medium">Języki obce:</span>
              </div>
              <ToggleGroup
                value={selectedGroups.lang === null ? ['all'] : [String(selectedGroups.lang)]}
                onValueChange={(val) => {
                  const sel = val[0]
                  handleCategoryChange('lang', !sel || sel === 'all' ? null : Number(sel))
                }}
                variant="outline"
                size="sm"
                className="p-0.5 rounded-lg bg-muted/40 border border-border/50 gap-0.5 flex-wrap"
              >
                <ToggleGroupItem value="all" className="px-2 py-0.5 text-[11px] h-6 rounded-md">
                  Wszystkie
                </ToggleGroupItem>
                {availableGroups.lang.map((num) => (
                  <ToggleGroupItem
                    key={num}
                    value={String(num)}
                    className="px-2 py-0.5 text-[11px] h-6 rounded-md"
                  >
                    {formatGroupLabel('lang', num)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {availableGroups.wf.length > 0 && (
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-[120px]">
                <Dumbbell className="size-3.5 text-emerald-500" />
                <span className="font-medium">WF:</span>
              </div>
              <ToggleGroup
                value={selectedGroups.wf === null ? ['all'] : [String(selectedGroups.wf)]}
                onValueChange={(val) => {
                  const sel = val[0]
                  handleCategoryChange('wf', !sel || sel === 'all' ? null : Number(sel))
                }}
                variant="outline"
                size="sm"
                className="p-0.5 rounded-lg bg-muted/40 border border-border/50 gap-0.5 flex-wrap"
              >
                <ToggleGroupItem value="all" className="px-2 py-0.5 text-[11px] h-6 rounded-md">
                  Wszystkie
                </ToggleGroupItem>
                {availableGroups.wf.map((num) => (
                  <ToggleGroupItem
                    key={num}
                    value={String(num)}
                    className="px-2 py-0.5 text-[11px] h-6 rounded-md"
                  >
                    {formatGroupLabel('wf', num)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
