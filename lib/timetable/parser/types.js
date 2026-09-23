/**
 * @typedef {Object} ListItem
 * @property {string} name Nazwa jednostki (np. "5T_A", "M.BABIARZ (MV)", "W10")
 * @property {string} value Identyfikator w Optivum (np. "1", "19", "22")
 */

/**
 * @typedef {Object} List
 * @property {ListItem[]} classes Lista oddziałów/klas
 * @property {ListItem[]} teachers Lista nauczycieli
 * @property {ListItem[]} rooms Lista sal lekcyjnych
 */

/**
 * @typedef {Object} LessonItem
 * @property {string} subject Nazwa przedmiotu
 * @property {string} [groupName] Oznaczenie grupy (np. "1/2", "2/2", "I/2")
 * @property {string} [teacher] Skrót nauczyciela (np. "MV")
 * @property {string} [teacherId] Identyfikator nauczyciela w Optivum (np. "14")
 * @property {string} [room] Nazwa sali (np. "10", "W10")
 * @property {string} [roomId] Identyfikator sali w Optivum (np. "2")
 * @property {string} [className] Nazwa klasy w widoku nauczyciela lub sali (np. "1A")
 * @property {string} [classId] Identyfikator klasy w Optivum (np. "1")
 */

/**
 * @typedef {Object} TableHour
 * @property {number} number Numer lekcji (np. 1, 2, 3...)
 * @property {string} timeFrom Godzina rozpoczęcia (np. "08:00")
 * @property {string} timeTo Godzina zakończenia (np. "08:45")
 */

/**
 * @typedef {Object} Table
 * @property {string} title Tytuł planu (np. nazwa klasy, nauczyciela, sali)
 * @property {string[]} dayNames Nazwy dni tygodnia z nagłówka tabeli
 * @property {Record<number, TableHour>} hours Godziny lekcyjne indeksowane numerem lekcji
 * @property {LessonItem[][][]} rawDays Macierz lekcji [hourIndex][dayIndex] -> LessonItem[]
 */

export {}
