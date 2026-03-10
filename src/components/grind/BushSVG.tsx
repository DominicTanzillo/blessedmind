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
}

const PALETTES: BushPalette[] = [
  // 0 - Forest green
  { base: '#5a8a4a', light: '#7aaa6a', dark: '#3a6a2a', berry: '#c94040', flower: '#f0c0d0' },
  // 1 - Teal bush
  { base: '#4a7a6a', light: '#6a9a8a', dark: '#2a5a4a', berry: '#d4a040', flower: '#a0d4e0' },
  // 2 - Olive
  { base: '#6a7a4a', light: '#8a9a6a', dark: '#4a5a2a', berry: '#9050a0', flower: '#d0b0e0' },
  // 3 - Emerald
  { base: '#3a8a5a', light: '#5aaa7a', dark: '#2a6a3a', berry: '#e06040', flower: '#f0e0a0' },
  // 4 - Spring green
  { base: '#5aaa50', light: '#7aca70', dark: '#3a8a30', berry: '#d04080', flower: '#f0a0c0' },
]

/** Bush SVG for pomodoro completions in the terrarium */
export default function BushSVG({ stage, size = 36, colorVariant = 0 }: Props) {
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
      <g className="animate-plant-sway" style={{ transformOrigin: '18px 30px' }}>
        {stage <= 1 && <TinyBush p={p} />}
        {stage === 2 && <SmallBush p={p} />}
        {stage === 3 && <MediumBush p={p} />}
        {stage === 4 && <LargeBush p={p} />}
      </g>
    </svg>
  )
}

/** Tiny round shrub */
function TinyBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="27" rx="6" ry="4.5" fill={p.base} />
      <ellipse cx="18" cy="25.5" rx="4.5" ry="3.5" fill={p.light} />
    </g>
  )
}

/** Small bush with some texture */
function SmallBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="27" rx="8" ry="5.5" fill={p.dark} />
      <ellipse cx="16" cy="25" rx="6" ry="4.5" fill={p.base} />
      <ellipse cx="20" cy="25" rx="6" ry="4.5" fill={p.base} />
      <ellipse cx="18" cy="23.5" rx="5" ry="3.5" fill={p.light} />
      {/* Small berries */}
      <circle cx="14" cy="26" r="1" fill={p.berry} opacity="0.8" />
      <circle cx="22" cy="25" r="1" fill={p.berry} opacity="0.8" />
    </g>
  )
}

/** Medium bush with flowers */
function MediumBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="27" rx="10" ry="6" fill={p.dark} />
      <ellipse cx="14" cy="25" rx="7" ry="5" fill={p.base} />
      <ellipse cx="22" cy="25" rx="7" ry="5" fill={p.base} />
      <ellipse cx="18" cy="23" rx="6" ry="4" fill={p.light} />
      {/* Flowers */}
      <circle cx="13" cy="24" r="1.5" fill={p.flower} />
      <circle cx="13" cy="24" r="0.6" fill={p.berry} />
      <circle cx="23" cy="23" r="1.5" fill={p.flower} />
      <circle cx="23" cy="23" r="0.6" fill={p.berry} />
      <circle cx="18" cy="21.5" r="1.5" fill={p.flower} />
      <circle cx="18" cy="21.5" r="0.6" fill={p.berry} />
      {/* Berries */}
      <circle cx="10" cy="26" r="0.8" fill={p.berry} opacity="0.7" />
      <circle cx="26" cy="26" r="0.8" fill={p.berry} opacity="0.7" />
    </g>
  )
}

/** Large lush bush with many flowers and berries */
function LargeBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="28" rx="12" ry="7" fill={p.dark} />
      <ellipse cx="12" cy="25" rx="8" ry="6" fill={p.base} />
      <ellipse cx="24" cy="25" rx="8" ry="6" fill={p.base} />
      <ellipse cx="18" cy="22" rx="8" ry="5" fill={p.light} />
      <ellipse cx="15" cy="20" rx="5" ry="3.5" fill={p.base} opacity="0.7" />
      <ellipse cx="21" cy="20" rx="5" ry="3.5" fill={p.base} opacity="0.7" />
      {/* Many flowers */}
      <circle cx="11" cy="24" r="1.8" fill={p.flower} />
      <circle cx="11" cy="24" r="0.7" fill={p.berry} />
      <circle cx="25" cy="23" r="1.8" fill={p.flower} />
      <circle cx="25" cy="23" r="0.7" fill={p.berry} />
      <circle cx="18" cy="20" r="1.8" fill={p.flower} />
      <circle cx="18" cy="20" r="0.7" fill={p.berry} />
      <circle cx="14" cy="21" r="1.5" fill={p.flower} opacity="0.8" />
      <circle cx="22" cy="21" r="1.5" fill={p.flower} opacity="0.8" />
      {/* Berries scattered */}
      <circle cx="9" cy="26" r="0.9" fill={p.berry} opacity="0.8" />
      <circle cx="27" cy="25" r="0.9" fill={p.berry} opacity="0.8" />
      <circle cx="16" cy="19" r="0.7" fill={p.berry} opacity="0.7" />
      <circle cx="20" cy="19" r="0.7" fill={p.berry} opacity="0.7" />
    </g>
  )
}
