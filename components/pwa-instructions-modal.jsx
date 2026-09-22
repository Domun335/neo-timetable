'use client'

import Image from 'next/image'
import { schoolConfig } from '@/school.config'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import {
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  Smartphone,
  Laptop,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

export function PwaInstructionsModal() {
  const { isInstructionsOpen, closeInstructions, platform, hasNativePrompt, install } =
    usePwaInstall()

  const defaultTab = platform === 'ios' ? 'ios' : platform === 'android' ? 'android' : 'desktop'

  return (
    <Dialog open={isInstructionsOpen} onOpenChange={(open) => !open && closeInstructions()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-border/70 shadow-2xl">
        <DialogHeader className="px-5 sm:px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl overflow-hidden ring-1 ring-border/60 bg-muted/50 p-1 shrink-0 shadow-2xs">
              <Image
                src={schoolConfig.branding?.logo || '/logo.svg'}
                alt={schoolConfig.shortName}
                width={36}
                height={36}
                className="size-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  Zainstaluj {schoolConfig.shortName}
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 font-semibold uppercase tracking-wider shrink-0"
                >
                  Aplikacja
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Dodaj plan lekcji do ekranu głównego telefonu lub komputera
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
            <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Zainstalowana aplikacja działa na pełnym ekranie, uruchamia się szybciej i nie wymaga
              wpisywania adresu w przeglądarce.
            </p>
          </div>

          {hasNativePrompt && (
            <Button
              type="button"
              onClick={install}
              className="w-full gap-2 rounded-xl py-5 text-sm font-semibold shadow-xs"
            >
              <Download className="size-4.5" />
              Zainstaluj jednym kliknięciem
            </Button>
          )}

          <Tabs defaultValue={defaultTab} className="w-full gap-3 flex flex-col">
            <TabsList className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 text-xs w-full !h-auto">
              <TabsTrigger
                value="ios"
                className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs"
              >
                <Smartphone className="size-3.5 shrink-0" />
                <span>iPhone / iOS</span>
              </TabsTrigger>
              <TabsTrigger
                value="android"
                className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs"
              >
                <Smartphone className="size-3.5 shrink-0" />
                <span>Android</span>
              </TabsTrigger>
              <TabsTrigger
                value="desktop"
                className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg font-medium text-xs data-active:bg-background data-active:text-foreground data-active:shadow-xs"
              >
                <Laptop className="size-3.5 shrink-0" />
                <span>Komputer</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="space-y-3 pt-1">
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    1
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      Stuknij Udostępnij
                      <Share className="size-3.5 text-primary" />
                    </p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      W przeglądarce <strong className="text-foreground">Safari</strong> stuknij
                      ikonę udostępniania na dolnym pasku ekranu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    2
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      Do ekranu początkowego
                      <PlusSquare className="size-3.5 text-primary" />
                    </p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Przewiń listę opcji w dół i wybierz polecenie{' '}
                      <strong className="text-foreground">„Do ekranu początkowego”</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-foreground">Potwierdź dodanie</p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Kliknij <strong className="text-foreground">„Dodaj”</strong> w prawym górnym
                      rogu. Ikona planu lekcji pojawi się na Twoim pulpicie.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="android" className="space-y-3 pt-1">
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    1
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      Otwórz menu przeglądarki
                      <MoreVertical className="size-3.5 text-primary" />
                    </p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      W przeglądarce <strong className="text-foreground">Chrome</strong> lub{' '}
                      <strong className="text-foreground">Brave</strong> stuknij trzy pionowe kropki
                      w prawym górnym rogu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    2
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      Wybierz instalację
                      <Download className="size-3.5 text-primary" />
                    </p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Wybierz opcję{' '}
                      <strong className="text-foreground">„Zainstaluj aplikację”</strong> lub{' '}
                      <strong className="text-foreground">„Dodaj do ekranu głównego”</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-foreground">Potwierdź instalację</p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Zatwierdź komunikat ekranowy. Aplikacja zainstaluje się na urządzeniu i pojawi
                      w spisie aplikacji.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="desktop" className="space-y-3 pt-1">
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    1
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      Safari na Macu (macOS Sonoma / Sequoia)
                      <Laptop className="size-3.5 text-primary" />
                    </p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      W menu górnym kliknij{' '}
                      <strong className="text-foreground">Plik → Dodaj do Docka...</strong> (lub
                      kliknij ikonę Udostępnij w prawym górnym rogu okna Safari →{' '}
                      <em>Dodaj do Docka</em>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    2
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      Chrome, Edge lub Brave
                      <Download className="size-3.5 text-primary" />
                    </p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Kliknij ikonę instalacji (komputer ze strzałką) po prawej stronie paska adresu
                      obok gwiazdki lub w menu (trzy kropki) wybierz{' '}
                      <strong className="text-foreground">„Zainstaluj aplikację”</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="m-0 px-5 sm:px-6 py-3.5 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeInstructions}
            className="rounded-xl text-xs px-4"
          >
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
