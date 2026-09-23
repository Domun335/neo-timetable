/**
 * Czyści i dekoduje tekst z węzła node-html-parser lub ciągu znaków:
 * - dekoduje encje HTML (np. &nbsp;, &amp;, &quot;)
 * - zamienia encje &nbsp; oraz spacje niełamliwe (\u00a0) na zwykłe spacje
 * - usuwa nadmiarowe odstępy i obcina brzegi (trim)
 *
 * @param {import('node-html-parser').Node | string | null | undefined} nodeOrText
 * @returns {string}
 */
export function cleanText(nodeOrText) {
  if (!nodeOrText) return ''
  const raw =
    typeof nodeOrText === 'string' ? nodeOrText : (nodeOrText.text ?? nodeOrText.innerText ?? '')
  return raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
