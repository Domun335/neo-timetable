/**
 * @typedef {Object} ListItem
 * @property {string} name Nazwa jednostki (np. "5T_A", "M.BABIARZ (MV)", "W10")
 * @property {string} value Identyfikator w Optivum (np. "1", "19", "22")
 * @property {string} [shortName] Skrót (np. "MV" dla nauczyciela)
 * @property {string} [fullName] Pełna nazwa (np. "M.BABIARZ" dla nauczyciela)
 */

/**
 * @typedef {Object} TimetableListResult
 * @property {ListItem[]} classes Lista oddziałów/klas
 * @property {ListItem[]} teachers Lista nauczycieli
 * @property {ListItem[]} rooms Lista sal lekcyjnych
 * @property {Record<string, ListItem>} teacherByShort Mapowanie skrótu (np. "SK") na obiekt nauczyciela
 * @property {Record<string, ListItem>} teacherById Mapowanie ID (np. "19") na obiekt nauczyciela
 * @property {Record<string, ListItem>} roomByName Mapowanie nazwy sali (np. "W10") na obiekt sali
 * @property {Record<string, ListItem>} roomById Mapowanie ID sali (np. "22") na obiekt sali
 * @property {Record<string, ListItem>} classByName Mapowanie nazwy klasy (np. "5T_A") na obiekt klasy
 * @property {Record<string, ListItem>} classById Mapowanie ID klasy (np. "1") na obiekt klasy
 */

/**
 * @typedef {Object} LessonItem
 * @property {string} subject Nazwa przedmiotu
 * @property {string} [groupName] Oznaczenie grupy (np. "1/2", "2/2")
 * @property {string} [teacher] Skrót nauczyciela
 * @property {string} [teacherId] Identyfikator nauczyciela w Optivum
 * @property {string} [teacherName] Pełna nazwa nauczyciela (z listy)
 * @property {string} [room] Nazwa sali
 * @property {string} [roomId] Identyfikator sali w Optivum
 * @property {string} [className] Nazwa klasy (w widoku nauczyciela lub sali)
 * @property {string} [classId] Identyfikator klasy w Optivum
 */

/**
 * @typedef {Object} TableHour
 * @property {number} number Numer lekcji (np. 1, 2, 3...)
 * @property {string} timeFrom Godzina rozpoczęcia (np. "08:00")
 * @property {string} timeTo Godzina zakończenia (np. "08:45")
 */

/**
 * @typedef {Object} ParsedTimetable
 * @property {'o'|'n'|'s'} type Typ jednostki: 'o' (klasa), 'n' (nauczyciel), 's' (sala)
 * @property {string} id Identyfikator numeryczny w Optivum
 * @property {string} title Tytuł planu (np. "5T_A", "T.BIAŁY (TB)", "10")
 * @property {string[]} dayNames Nazwy dni tygodnia (np. ["Poniedziałek", "Wtorek", ...])
 * @property {Record<number, TableHour>} hours Godziny lekcyjne
 * @property {LessonItem[][][]} rawDays Macierz lekcji [dzieńIndeks][godzinaIndeks] -> LessonItem[]
 * @property {string[]} groups Wykryte unikalne grupy w tym planie (np. ["1/2", "2/2"])
 */

export {}
