/**
 * Wzbogaca elementy lekcji o pełne nazwy i powiązania z listą jednostek
 * @param {import('./types').LessonItem} lesson
 * @param {import('./types').TimetableListResult} listData
 * @returns {import('./types').LessonItem}
 */
export function enrichLessonData(lesson, listData) {
  const enriched = { ...lesson }

  // Uzupełnienie danych nauczyciela
  if (enriched.teacher) {
    const byShort = listData.teacherByShort[enriched.teacher.toUpperCase()]
    if (byShort) {
      enriched.teacherName = byShort.fullName || byShort.name
      if (!enriched.teacherId) enriched.teacherId = byShort.value
    }
  }
  if (enriched.teacherId && !enriched.teacherName) {
    const byId = listData.teacherById[enriched.teacherId]
    if (byId) {
      enriched.teacherName = byId.fullName || byId.name
    }
  }

  // Uzupełnienie danych sali
  if (enriched.room && !enriched.roomId) {
    const byName = listData.roomByName[enriched.room.toUpperCase()]
    if (byName) {
      enriched.roomId = byName.value
    }
  }

  // Uzupełnienie danych klasy (w planie nauczyciela lub sali)
  if (enriched.className && !enriched.classId) {
    const byName = listData.classByName[enriched.className.toUpperCase()]
    if (byName) {
      enriched.classId = byName.value
    }
  }

  return enriched
}
