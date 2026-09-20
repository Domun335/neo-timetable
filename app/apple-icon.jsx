import { ImageResponse } from 'next/og'
import { schoolConfig } from '@/school.config'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'


export default function AppleIcon() {
  const primary = schoolConfig.branding?.primaryColor || '#0284c7'
  const accent = schoolConfig.branding?.accentColor || '#38bdf8'

  return new ImageResponse(
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
      <svg width="180" height="180" viewBox="0 0 256 256" fill="none">
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
    </div>,
    {
      ...size,
    },
  )
}

