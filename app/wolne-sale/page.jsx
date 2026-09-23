import { fetchAllRoomsOccupancy } from '@/lib/timetable/fetch-rooms-occupancy'
import { EmptyRoomsView } from '@/components/empty-rooms/empty-rooms-view'
import { schoolConfig } from '@/school.config'

export const revalidate = 3600 // ISR 1h

export async function generateMetadata() {
  return {
    title: 'Wolne sale lekcyjne',
    description: `Sprawdź które sale i pracownie lekcyjne są wolne w danej godzinie lekcyjnej w ${schoolConfig.shortName}.`,
  }
}

export default async function WolneSalePage() {
  const { rooms, hours, dayNames } = await fetchAllRoomsOccupancy()

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-[1600px] mx-auto p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <EmptyRoomsView rooms={rooms} hours={hours} dayNames={dayNames} />
    </div>
  )
}
