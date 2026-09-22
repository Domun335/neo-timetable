/**
 * Wzbogaca elementy lekcji o pełne nazwy i powiązania z listą jednostek
 * @param {import('./types').LessonItem} lesson
 * @param {import('./types').TimetableListResult} listData
 * @returns {import('./types').LessonItem}
 */
export function enrichLessonData(lesson, listData) {
  if (!listData) return lesson

  const enriched = { ...lesson }

  if (enriched.teacher) {
    const key = enriched.teacher.toUpperCase()
    const teacherMatch =
      listData.teacherByShort?.[key] ||
      listData.teacherByName?.[key] ||
      listData.teachers?.find(
        (t) =>
          t.shortName?.toUpperCase() === key ||
          t.name?.toUpperCase() === key ||
          t.fullName?.toUpperCase() === key,
      )

    if (teacherMatch) {
      enriched.teacherName = teacherMatch.fullName || teacherMatch.name
      if (!enriched.teacherId) enriched.teacherId = teacherMatch.value
    }
  }
  if (enriched.teacherId && !enriched.teacherName) {
    const byId = listData.teacherById?.[enriched.teacherId]
    if (byId) {
      enriched.teacherName = byId.fullName || byId.name
    }
  }

  if (enriched.room && !enriched.roomId) {
    const byName = listData.roomByName?.[enriched.room.toUpperCase()]
    if (byName) {
      enriched.roomId = byName.value
    }
  }

  // W widoku nauczyciela lub sali uzupełniamy identyfikator oddziału
  if (enriched.className && !enriched.classId) {
    const byName = listData.classByName?.[enriched.className.toUpperCase()]
    if (byName) {
      enriched.classId = byName.value
    }
  }

  return enriched
}
