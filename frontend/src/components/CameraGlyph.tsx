export function CameraGlyph({ slug }: { slug: string }) {
  const kind = slug.includes('360') ? '360' : slug.includes('bullet') ? 'bullet' : slug.includes('dome') ? 'dome' : 'generic'

  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
      <rect width="160" height="120" fill="#1A1F27" />
      <g stroke="#E6DFD2" strokeWidth="1.4" fill="none">
        {kind === '360' && (
          <>
            <circle cx="80" cy="60" r="28" />
            <circle cx="80" cy="60" r="16" />
            <circle cx="80" cy="60" r="4" fill="#C4622D" stroke="none" />
            <path d="M80 22 v10 M80 88 v10 M42 60 h10 M108 60 h10" />
          </>
        )}
        {kind === 'bullet' && (
          <>
            <rect x="38" y="42" width="70" height="36" rx="18" />
            <circle cx="108" cy="60" r="14" />
            <circle cx="108" cy="60" r="5" fill="#C4622D" stroke="none" />
            <path d="M38 60 H24" />
          </>
        )}
        {kind === 'dome' && (
          <>
            <path d="M40 78 Q80 28 120 78" />
            <path d="M48 78 h64" />
            <circle cx="80" cy="70" r="6" fill="#C4622D" stroke="none" />
          </>
        )}
        {kind === 'generic' && (
          <>
            <rect x="46" y="38" width="68" height="44" rx="6" />
            <circle cx="80" cy="60" r="12" />
            <circle cx="80" cy="60" r="4" fill="#C4622D" stroke="none" />
          </>
        )}
      </g>
    </svg>
  )
}
