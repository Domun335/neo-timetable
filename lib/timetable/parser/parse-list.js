import { parse } from 'node-html-parser'
import { cleanText } from './utils.js'

/**
 * Wykrywa typ listy w HTML strony lista.html VULCAN Optivum
 * @param {import('node-html-parser').HTMLElement} root
 * @returns {'select' | 'expandable' | 'unordered'}
 */
function detectListType(root) {
  if (root.querySelector('form[name=form]')) return 'select'
  if (root.querySelector('body table')) return 'expandable'
  return 'unordered'
}

/**
 * Wyciąga czysty identyfikator jednostki z linku href (np. "plany/o1.html", "o1.html", "/plany/n14.html" -> "1" / "14")
 * @param {string} href
 * @param {string} prefix - 'o', 'n', 's'
 * @returns {string}
 */
function extractListValue(href, prefix) {
  const cleanHref = href || ''
  const match = cleanHref.match(new RegExp(`(?:^|/)${prefix}(\\d+)\\.html$`, 'i'))
  if (match) return match[1]

  return cleanHref
    .replace(/\.html$/i, '')
    .replace(new RegExp(`^(?:/?plany/)?${prefix}`, 'i'), '')
    .replace(/^\//, '')
}

/**
 * Parsuje liste typu select (rozwijane pola)
 * @param {import('node-html-parser').HTMLElement} root
 * @returns {import('./types.js').List}
 */
function parseSelectList(root) {
  const getOptions = (name) => {
    const [, ...nodes] = root.querySelectorAll(`[name=${name}] option`) // pomijamy pierwszy element (placeholder)
    return nodes.map((node) => ({
      name: cleanText(node),
      value: node.getAttribute('value') || '',
    }))
  }

  return {
    classes: getOptions('oddzialy'),
    teachers: getOptions('nauczyciele'),
    rooms: getOptions('sale'),
  }
}

/**
 * Parsuje liste typu expandable (tabela z sekcjami #oddzialy, #nauczyciele, #sale)
 * @param {import('node-html-parser').HTMLElement} root
 * @returns {import('./types.js').List}
 */
function parseExpandableList(root) {
  const getLinks = (selector, prefix) => {
    return root.querySelectorAll(selector).map((a) => ({
      name: cleanText(a),
      value: extractListValue(a.getAttribute('href'), prefix),
    }))
  }

  return {
    classes: getLinks('#oddzialy a', 'o'),
    teachers: getLinks('#nauczyciele a', 'n'),
    rooms: getLinks('#sale a', 's'),
  }
}

/**
 * Parsuje liste typu unordered (listy <ul> z linkami)
 * @param {import('node-html-parser').HTMLElement} root
 * @returns {import('./types.js').List}
 */
function parseUnorderedList(root) {
  const h4s = root.querySelectorAll('h4')

  let teachersQuery = 'ul:nth-of-type(2) a'
  let roomsQuery = 'ul:nth-of-type(3) a'

  if (h4s.length === 1) {
    // Tylko oddzialy
    teachersQuery = null
    roomsQuery = null
  } else if (cleanText(h4s[1]) === 'Sale') {
    // Oddzialy + Sale (bez nauczycieli)
    teachersQuery = null
    roomsQuery = 'ul:nth-of-type(2) a'
  }

  const getLinks = (query, prefix) => {
    if (!query) return []
    return root.querySelectorAll(query).map((a) => ({
      name: cleanText(a),
      value: extractListValue(a.getAttribute('href'), prefix),
    }))
  }

  return {
    classes: getLinks('ul:first-of-type a', 'o'),
    teachers: getLinks(teachersQuery, 'n'),
    rooms: getLinks(roomsQuery, 's'),
  }
}

/**
 * Parsuje strone HTML listy VULCAN Optivum (lista.html)
 * Obsługuje wszystkie 3 warianty layoutu: select, expandable, unordered
 *
 * @param {string} html - surowy HTML strony lista.html
 * @returns {import('./types.js').List}
 */
export function parseList(html) {
  const root = parse(html)
  const type = detectListType(root)

  switch (type) {
    case 'select':
      return parseSelectList(root)
    case 'expandable':
      return parseExpandableList(root)
    default:
      return parseUnorderedList(root)
  }
}

/**
 * Zwraca adres URL logo szkoly z listy (jesli istnieje)
 * @param {string} html
 * @returns {string | null}
 */
export function parseLogoSrc(html) {
  const root = parse(html)
  return root.querySelector('.logo img')?.getAttribute('src') || null
}
