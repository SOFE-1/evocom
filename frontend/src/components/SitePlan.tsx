export function SitePlan() {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12171e] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <svg viewBox="0 0 520 380" className="h-auto w-full" role="img" aria-label="Sample floor plan with three camera positions">
        <rect x="24" y="24" width="472" height="300" rx="8" fill="#1c232c" stroke="#3a4452" />
        <path d="M24 150 H496 M250 24 V324 M24 250 H250" stroke="#3a4452" />
        <text x="40" y="48" fill="#8b97a6" fontSize="12" fontFamily="Outfit, sans-serif">
          Shop floor
        </text>
        <text x="266" y="48" fill="#8b97a6" fontSize="12" fontFamily="Outfit, sans-serif">
          Office
        </text>
        <text x="40" y="274" fill="#8b97a6" fontSize="12" fontFamily="Outfit, sans-serif">
          Parking approach
        </text>
        <path d="M70 70 L150 130 L70 150 Z" fill="#c4622d" opacity="0.35" />
        <circle cx="70" cy="70" r="6" fill="#f3efe6" />
        <text x="82" y="74" fill="#f3efe6" fontSize="11" fontFamily="Outfit, sans-serif">
          360°
        </text>
        <path d="M470 90 L390 70 L400 140 Z" fill="#c4622d" opacity="0.28" />
        <circle cx="470" cy="90" r="6" fill="#f3efe6" />
        <text x="392" y="168" fill="#f3efe6" fontSize="11" fontFamily="Outfit, sans-serif">
          Dome
        </text>
        <path d="M60 300 L150 270 L70 250 Z" fill="#c4622d" opacity="0.35" />
        <circle cx="60" cy="300" r="6" fill="#f3efe6" />
        <text x="74" y="304" fill="#f3efe6" fontSize="11" fontFamily="Outfit, sans-serif">
          Bullet
        </text>
      </svg>
      <figcaption className="px-2 pb-1 text-xs text-paper/70">
        Sample coverage. Final placement is confirmed on site, or from the layout you upload.
      </figcaption>
    </figure>
  )
}
