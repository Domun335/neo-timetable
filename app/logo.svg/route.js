import { schoolConfig } from '@/school.config'

export const dynamic = 'force-static'

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{3,8}$/
const sanitizeHexColor = (color, fallback) =>
  typeof color === 'string' && HEX_COLOR_REGEX.test(color) ? color : fallback

export function GET() {
  const primary = sanitizeHexColor(schoolConfig.branding?.primaryColor, '#1b6ca8')
  const accent = sanitizeHexColor(schoolConfig.branding?.accentColor, '#0c4a6e')

  const svg = `<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>
  <path d="M176 8H80C40.2356 8 8 40.2356 8 80V176C8 215.7644 40.2356 248 80 248H176C215.7644 248 248 215.7644 248 176V80C248 40.2356 215.7644 8 176 8Z" fill="url(#brand-grad)"/>
  <path d="M128 72L204 108L128 144L52 108L128 72Z" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M82 126V150C82 168 174 168 174 150V126" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M188 118V156" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
