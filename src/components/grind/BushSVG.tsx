interface Props {
  stage: 0 | 1 | 2 | 3 | 4
  size?: number
  colorVariant?: number
}

interface BushPalette {
  base: string
  light: string
  dark: string
  berry: string
  flower: string
  accent: string
}

const PALETTES: BushPalette[] = [
  // 0 - Deep hedge
  { base: '#3d5a30', light: '#4a6b3a', dark: '#2a4020', berry: '#c94040', flower: '#f0c0d0', accent: '#e8a8a8' },
  // 1 - Berry bush (purple-tinged)
  { base: '#4a4a60', light: '#5a5a70', dark: '#353548', berry: '#d06090', flower: '#f0b8d0', accent: '#e0a0c0' },
  // 2 - Autumn bush (warm browns/oranges)
  { base: '#6a5a3a', light: '#7a6a4a', dark: '#4a3a20', berry: '#d07030', flower: '#f0d0a0', accent: '#e8c080' },
  // 3 - Holly (dark with red berries)
  { base: '#2a4a30', light: '#3a5a3a', dark: '#1a3020', berry: '#cc3030', flower: '#f0e0a0', accent: '#dd4444' },
  // 4 - Flowering (dark with pink blooms)
  { base: '#3a4a3a', light: '#4a5a48', dark: '#2a3828', berry: '#c05080', flower: '#f5b0d0', accent: '#e090b0' },
]

/** Bush SVG for pomodoro completions — centered at viewBox midpoint */
export default function BushSVG({ stage, size = 40, colorVariant = 0 }: Props) {
  const p = PALETTES[colorVariant % PALETTES.length]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-plant-grow"
    >
      <g className="animate-plant-sway" style={{ transformOrigin: '18px 22px' }}>
        {stage <= 1 && <TinyBush p={p} />}
        {stage === 2 && <SmallBush p={p} />}
        {stage === 3 && <MediumBush p={p} />}
        {stage === 4 && <LargeBush p={p} />}
      </g>
    </svg>
  )
}

/** Tiny round shrub — centered around y=18 */
function TinyBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="21" rx="7" ry="5" fill={p.dark} />
      <ellipse cx="18" cy="19.5" rx="5" ry="4" fill={p.base} />
      <ellipse cx="18" cy="18.5" rx="3.5" ry="3" fill={p.light} />
      <circle cx="15" cy="20" r="1.2" fill={p.berry} />
      <circle cx="21" cy="19" r="1.2" fill={p.berry} />
    </g>
  )
}

/** Small bush — centered around y=18 */
function SmallBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="21" rx="9" ry="6" fill={p.dark} />
      <ellipse cx="16" cy="19" rx="6" ry="5" fill={p.base} />
      <ellipse cx="20" cy="19" rx="6" ry="5" fill={p.base} />
      <ellipse cx="18" cy="17.5" rx="5" ry="3.5" fill={p.light} />
      <circle cx="13" cy="20" r="1.3" fill={p.berry} />
      <circle cx="23" cy="19" r="1.3" fill={p.berry} />
      <circle cx="18" cy="16" r="1.3" fill={p.berry} opacity="0.9" />
    </g>
  )
}

/** Medium bush with flowers and butterfly — centered around y=18 */
function MediumBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="21" rx="11" ry="6.5" fill={p.dark} />
      <ellipse cx="14" cy="19" rx="7" ry="5.5" fill={p.base} />
      <ellipse cx="22" cy="19" rx="7" ry="5.5" fill={p.base} />
      <ellipse cx="18" cy="17" rx="6" ry="4" fill={p.light} />
      {/* Flowers */}
      <circle cx="12" cy="18" r="2" fill={p.flower} />
      <circle cx="12" cy="18" r="0.8" fill={p.berry} />
      <circle cx="24" cy="17" r="2" fill={p.flower} />
      <circle cx="24" cy="17" r="0.8" fill={p.berry} />
      <circle cx="18" cy="15" r="2" fill={p.flower} />
      <circle cx="18" cy="15" r="0.8" fill={p.berry} />
      {/* Berries */}
      <circle cx="9" cy="20" r="1" fill={p.accent} opacity="0.9" />
      <circle cx="27" cy="20" r="1" fill={p.accent} opacity="0.9" />
      {/* Butterfly */}
      <g transform="translate(27, 11)" className="animate-breathe" style={{ transformOrigin: '0 0' }}>
        <ellipse cx="-2" cy="0" rx="2.2" ry="1.5" fill={p.flower} opacity="0.8" transform="rotate(-20)" />
        <ellipse cx="2" cy="0" rx="2.2" ry="1.5" fill={p.flower} opacity="0.8" transform="rotate(20)" />
        <ellipse cx="0" cy="0" rx="0.5" ry="1.2" fill={p.dark} />
      </g>
    </g>
  )
}

/** Large lush bush with flowers, berries, bird, butterfly — centered around y=18 */
function LargeBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="22" rx="13" ry="7.5" fill={p.dark} />
      <ellipse cx="12" cy="19" rx="8" ry="6" fill={p.base} />
      <ellipse cx="24" cy="19" rx="8" ry="6" fill={p.base} />
      <ellipse cx="18" cy="16" rx="8" ry="5" fill={p.light} />
      <ellipse cx="15" cy="14" rx="5" ry="3.5" fill={p.base} opacity="0.8" />
      <ellipse cx="21" cy="14" rx="5" ry="3.5" fill={p.base} opacity="0.8" />
      {/* Flowers */}
      <circle cx="10" cy="18" r="2.2" fill={p.flower} />
      <circle cx="10" cy="18" r="0.9" fill={p.berry} />
      <circle cx="26" cy="17" r="2.2" fill={p.flower} />
      <circle cx="26" cy="17" r="0.9" fill={p.berry} />
      <circle cx="18" cy="13.5" r="2.2" fill={p.flower} />
      <circle cx="18" cy="13.5" r="0.9" fill={p.berry} />
      <circle cx="14" cy="15" r="1.8" fill={p.flower} opacity="0.9" />
      <circle cx="22" cy="15" r="1.8" fill={p.flower} opacity="0.9" />
      {/* Berries */}
      <circle cx="8" cy="20" r="1.1" fill={p.accent} />
      <circle cx="28" cy="19.5" r="1.1" fill={p.accent} />
      <circle cx="16" cy="12.5" r="0.9" fill={p.accent} opacity="0.8" />
      <circle cx="20" cy="12.5" r="0.9" fill={p.accent} opacity="0.8" />
      {/* Small bird */}
      <g transform="translate(24, 9)">
        <ellipse cx="0" cy="0" rx="2.2" ry="1.5" fill="#8B7355" />
        <circle cx="-1.8" cy="-0.8" r="1.1" fill="#9B8365" />
        <path d="M-2.9,-0.8 L-3.6,-0.5 L-2.9,-0.5Z" fill="#E8A040" />
        <circle cx="-2.1" cy="-1" r="0.35" fill="#2a2a2a" />
        <path d="M1.5,0 Q3,-1.5 3.5,-0.5 Q3,0.5 1.5,0Z" fill="#7A6345" />
      </g>
      {/* Butterfly */}
      <g transform="translate(8, 12)" className="animate-breathe" style={{ transformOrigin: '0 0' }}>
        <ellipse cx="-2" cy="0" rx="2" ry="1.3" fill={p.flower} opacity="0.7" transform="rotate(-25)" />
        <ellipse cx="2" cy="0" rx="2" ry="1.3" fill={p.flower} opacity="0.7" transform="rotate(25)" />
        <ellipse cx="0" cy="0" rx="0.4" ry="1" fill={p.dark} />
      </g>
    </g>
  )
}
