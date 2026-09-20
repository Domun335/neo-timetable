import { ImageResponse } from 'next/og'
import { schoolConfig } from '@/school.config'

export const dynamic = 'force-static'

const ICON_CONFIGS = {
  'icon-192.png': { size: 192, maskable: false },
  'icon-512.png': { size: 512, maskable: false },
  'icon-maskable-192.png': { size: 192, maskable: true },
  'icon-maskable-512.png': { size: 512, maskable: true },
}

export async function generateStaticParams() {
  return Object.keys(ICON_CONFIGS).map((name) => ({ name }))
}

export async function GET(request, { params }) {
  const { name } = await params
  const config = ICON_CONFIGS[name]

  if (!config) {
    return new Response('Not found', { status: 404 })
  }

  const { size, maskable } = config
  const primary = schoolConfig.branding?.primaryColor || '#0284c7'
  const accent = schoolConfig.branding?.accentColor || '#38bdf8'

  if (maskable) {
    // Maskable icons fill 100% of the canvas with the background gradient,
    // keeping the emblem within the 80% safe zone circle so Android adaptive icons
    // can mask it to any shape without clipping.
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
          }}
        >
          <svg
            width={Math.round(size * 0.72)}
            height={Math.round(size * 0.72)}
            viewBox="0 0 256 256"
            fill="none"
          >
            <path
              d="M128 72L204 108L128 144L52 108L128 72Z"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M82 126V150C82 168 174 168 174 150V126"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M188 118V156"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      {
        width: size,
        height: size,
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      },
    )
  }

  // Standard "any" icon: squircle with brand gradient and transparent background,
  // matching favicon exactly.
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg width={size} height={size} viewBox="0 0 256 256" fill="none">
          <defs>
            <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} />
              <stop offset="100%" stopColor={accent} />
            </linearGradient>
          </defs>
          <path
            d="M176 8H80C40.2356 8 8 40.2356 8 80V176C8 215.7644 40.2356 248 80 248H176C215.7644 248 248 215.7644 248 176V80C248 40.2356 215.7644 8 176 8Z"
            fill="url(#brand-grad)"
          />
          <path
            d="M128 72L204 108L128 144L52 108L128 72Z"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M82 126V150C82 168 174 168 174 150V126"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M188 118V156"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    },
  )
}
