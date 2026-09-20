/**
 * Usuwa polskie znaki diakrytyczne i zamienia tekst na małe litery
 * @param {string} text
 * @returns {string}
 */
export function normalizeSearchText(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'l')
    .trim()
}
