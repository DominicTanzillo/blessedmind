interface Props {
  stage: 0 | 1 | 2 | 3 | 4
  size?: number
  colorVariant?: number
}

interface BushPalette {
  base: string
  light: string
  shadow: string
  berry: string
  flower: string
  accent: string
}

// Harmonious palettes — muted, natural, each a distinct mood
const PALETTES: BushPalette[] = [
  // 0 - Holly — deep forest with warm red berries
  { base: '#3a5a38', light: '#4a6a48', shadow: '#2a4528', berry: '#b84040', flower: '#e8d8d0', accent: '#d06050' },
  // 1 - Lavender — silvery green with purple blooms
  { base: '#4a5060', light: '#5a6070', shadow: '#383e50', berry: '#8060a8', flower: '#d0c0e0', accent: '#a080c0' },
  // 2 - Autumn — warm amber and ochre
  { base: '#5a5030', light: '#6a6040', shadow: '#484020', berry: '#c08030', flower: '#f0e0b0', accent: '#d89840' },
  // 3 - Ocean — cool teal with white flowers
  { base: '#385050', light: '#486060', shadow: '#283a3a', berry: '#509090', flower: '#d8e8e8', accent: '#68a8a8' },
  // 4 - Rose — deep green with blush blooms
  { base: '#385038', light: '#486048', shadow: '#284028', berry: '#b06070', flower: '#f0d0d8', accent: '#c88098' },
  // 5 - Sunlight — bright sage with golden berries
  { base: '#4a6a38', light: '#5a7a48', shadow: '#3a5828', berry: '#c0a030', flower: '#f0e880', accent: '#d8c040' },
  // 6 - Blueberry — steel blue-green with indigo fruit
  { base: '#384858', light: '#485868', shadow: '#283848', berry: '#505090', flower: '#c0c8e0', accent: '#6868a8' },
  // 7 - Ember — charcoal with warm orange glow
  { base: '#484038', light: '#585048', shadow: '#383028', berry: '#c86030', flower: '#f0d8b0', accent: '#e07838' },
  // 8 - Fern — rich green with cream accents
  { base: '#385a38', light: '#486a48', shadow: '#284828', berry: '#80a060', flower: '#e8e8d0', accent: '#98b878' },
  // 9 - Dusk — plum with soft peach tones
  { base: '#484048', light: '#585058', shadow: '#383038', berry: '#a87068', flower: '#e8d0c8', accent: '#c08880' },
]

/**
 * Bush — pomodoro completion.
 * Soft organic canopy shapes, layered for depth.
 * Grows from a tiny sprout to a full bush with berries and flowers.
 */
export default function BushSVG({ stage, size = 42, colorVariant = 0 }: Props) {
  const p = PALETTES[colorVariant % PALETTES.length]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-plant-grow"
      style={{ overflow: 'hidden' }}
    >
      <g className="animate-plant-sway" style={{ transformOrigin: '18px 30px' }}>
        {stage <= 1 && <Tiny p={p} />}
        {stage === 2 && <Small p={p} />}
        {stage === 3 && <Medium p={p} />}
        {stage === 4 && <Large p={p} />}
      </g>
    </svg>
  )
}

// ── Tiny (< 15 min) — just a tuft ────────────────────────
function Tiny({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="28" rx="5" ry="2" fill="rgba(0,0,0,0.04)" />
      <ellipse cx="18" cy="26" rx="6" ry="4" fill={p.shadow} opacity="0.6" />
      <ellipse cx="18" cy="25" rx="4.5" ry="3.2" fill={p.base} />
      <ellipse cx="17" cy="24" rx="3" ry="2.2" fill={p.light} opacity="0.7" />
      {/* Two small berries */}
      <circle cx="15.5" cy="25.5" r="1" fill={p.berry} opacity="0.7" />
      <circle cx="20" cy="24.5" r="0.8" fill={p.berry} opacity="0.6" />
    </g>
  )
}

// ── Small (15-29 min) — filling out ──────────────────────
function Small({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="28" rx="7" ry="2" fill="rgba(0,0,0,0.04)" />
      <ellipse cx="18" cy="26" rx="8" ry="5" fill={p.shadow} opacity="0.5" />
      <ellipse cx="16" cy="24.5" rx="5.5" ry="4" fill={p.base} />
      <ellipse cx="20" cy="24" rx="5.5" ry="4.2" fill={p.base} opacity="0.9" />
      <ellipse cx="18" cy="23" rx="4.5" ry="3" fill={p.light} opacity="0.6" />
      {/* Berries — clustered naturally */}
      <circle cx="13.5" cy="25" r="1.1" fill={p.berry} opacity="0.7" />
      <circle cx="22" cy="24" r="1" fill={p.berry} opacity="0.65" />
      <circle cx="18" cy="22" r="0.9" fill={p.berry} opacity="0.6" />
      {/* One small bloom */}
      <circle cx="15" cy="22.5" r="1.5" fill={p.flower} opacity="0.5" />
      <circle cx="15" cy="22.5" r="0.5" fill={p.accent} opacity="0.6" />
    </g>
  )
}

// ── Medium (30-59 min) — lush with character ─────────────
function Medium({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="29" rx="9" ry="2" fill="rgba(0,0,0,0.04)" />
      <ellipse cx="18" cy="27" rx="10" ry="5.5" fill={p.shadow} opacity="0.45" />
      <ellipse cx="15" cy="25" rx="6.5" ry="4.5" fill={p.base} />
      <ellipse cx="21" cy="24.5" rx="6.5" ry="4.8" fill={p.base} opacity="0.9" />
      <ellipse cx="18" cy="22.5" rx="5.5" ry="3.5" fill={p.light} opacity="0.55" />
      {/* Flowers — soft and spaced */}
      <circle cx="12" cy="24.5" r="1.8" fill={p.flower} opacity="0.55" />
      <circle cx="12" cy="24.5" r="0.7" fill={p.berry} opacity="0.5" />
      <circle cx="24" cy="23" r="1.6" fill={p.flower} opacity="0.5" />
      <circle cx="24" cy="23" r="0.6" fill={p.berry} opacity="0.45" />
      <circle cx="18" cy="21" r="1.7" fill={p.flower} opacity="0.5" />
      <circle cx="18" cy="21" r="0.7" fill={p.berry} opacity="0.45" />
      {/* Scattered berries */}
      <circle cx="10" cy="26" r="0.8" fill={p.accent} opacity="0.55" />
      <circle cx="26" cy="25.5" r="0.8" fill={p.accent} opacity="0.5" />
    </g>
  )
}

// ── Large (60+ min) — full, abundant, alive ──────────────
function Large({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="30" rx="11" ry="2.5" fill="rgba(0,0,0,0.04)" />
      {/* Deep shadow base */}
      <ellipse cx="18" cy="28" rx="12" ry="6" fill={p.shadow} opacity="0.4" />
      {/* Main body — overlapping organic shapes */}
      <ellipse cx="13" cy="25" rx="7" ry="5" fill={p.base} />
      <ellipse cx="23" cy="24.5" rx="7" ry="5.2" fill={p.base} opacity="0.9" />
      <ellipse cx="18" cy="22" rx="7" ry="4.5" fill={p.light} opacity="0.5" />
      {/* Upper volume — gives height */}
      <ellipse cx="15.5" cy="20" rx="5" ry="3.5" fill={p.base} opacity="0.6" />
      <ellipse cx="20.5" cy="19.5" rx="5" ry="3.2" fill={p.base} opacity="0.55" />
      {/* Flowers — generous but not cluttered */}
      <circle cx="10" cy="24.5" r="2" fill={p.flower} opacity="0.5" />
      <circle cx="10" cy="24.5" r="0.8" fill={p.berry} opacity="0.45" />
      <circle cx="26" cy="23.5" r="1.8" fill={p.flower} opacity="0.48" />
      <circle cx="26" cy="23.5" r="0.7" fill={p.berry} opacity="0.42" />
      <circle cx="18" cy="19.5" r="1.9" fill={p.flower} opacity="0.5" />
      <circle cx="18" cy="19.5" r="0.8" fill={p.berry} opacity="0.45" />
      <circle cx="14" cy="21" r="1.5" fill={p.flower} opacity="0.45" />
      <circle cx="22" cy="20.5" r="1.5" fill={p.flower} opacity="0.42" />
      {/* Berries — organic scatter */}
      <circle cx="8" cy="26" r="0.9" fill={p.accent} opacity="0.5" />
      <circle cx="28" cy="25" r="0.9" fill={p.accent} opacity="0.45" />
      <circle cx="16" cy="18.5" r="0.7" fill={p.accent} opacity="0.4" />
      <circle cx="20.5" cy="18" r="0.7" fill={p.accent} opacity="0.38" />
      {/* Light dapples — sunlight catching leaves */}
      <circle cx="15" cy="22" r="1.5" fill={p.light} opacity="0.2" />
      <circle cx="22" cy="21" r="1.2" fill={p.light} opacity="0.18" />
    </g>
  )
}
