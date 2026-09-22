import { notFound } from 'next/navigation'
import { fetchTimetable } from '@/lib/timetable/fetch-timetable.js'
import { fetchTimetableList } from '@/lib/timetable/fetch-list.js'
import { TimetableView } from '@/components/timetable/timetable-view'
import { schoolConfig } from '@/school.config'

export const revalidate = 3600 // ISR 1h

/**
 * Pre-renderowanie ścieżek dla wszystkich klas, nauczycieli i sal
 */
export async function generateStaticParams() {
  try {
    const list = await fetchTimetableList()
    const paths = []

    list.classes.forEach((c) => paths.push({ type: 'o', id: c.value }))
    list.teachers.forEach((t) => paths.push({ type: 'n', id: t.value }))
    list.rooms.forEach((r) => paths.push({ type: 's', id: r.value }))

    return paths
  } catch (e) {
    console.warn('Nie udało się wygenerować parametrów statycznych:', e)
    return [{ type: 'o', id: '1' }]
  }
}

/**
 * Generowanie metadanych SEO dla strony planu
 */
export async function generateMetadata({ params }) {
  const { type, id } = await params
  const cleanType = (type || '').toLowerCase()
  const cleanId = String(id || '').replace(/^[ons]/i, '')

  if (!['o', 'n', 's'].includes(cleanType) || !/^\d+$/.test(cleanId)) {
    return { title: 'Plan lekcji' }
  }

  try {
    const timetable = await fetchTimetable(cleanType, cleanId)
    const typeLabel =
      timetable.type === 'o' ? 'Oddział' : timetable.type === 'n' ? 'Nauczyciel' : 'Sala'

    return {
      title: `${timetable.title}`,
      description: `Sprawdź aktualny plan lekcji dla ${typeLabel.toLowerCase()} ${timetable.title} w ${schoolConfig.shortName}.`,
    }
  } catch {
    return {
      title: `Plan lekcji`,
    }
  }
}

export default async function TimetablePage({ params }) {
  const { type, id } = await params
  const cleanType = (type || '').toLowerCase()
  const cleanId = String(id || '').replace(/^[ons]/i, '')

  if (!['o', 'n', 's'].includes(cleanType) || !/^\d+$/.test(cleanId)) {
    notFound()
  }

  let timetable
  try {
    timetable = await fetchTimetable(cleanType, cleanId)
  } catch (error) {
    if (error?.status === 404 || error?.message?.includes('404')) {
      notFound()
    }

    console.error(`Błąd techniczny podczas ładowania planu ${type}/${id}:`, error)
    throw error
  }

  return <TimetableView timetable={timetable} />
}
