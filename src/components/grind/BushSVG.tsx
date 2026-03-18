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
  creature: 'butterfly' | 'ladybug' | 'bird' | 'squirrel' | 'dragonfly' | 'snail' | 'bee' | 'rabbit' | 'hedgehog' | 'firefly'
}

const PALETTES: BushPalette[] = [
  // 0 - Crimson Holly — deep green with bright red berries
  { base: '#2a4a28', light: '#3a5a35', dark: '#1a3518', berry: '#cc2828', flower: '#f0e0e0', accent: '#ee4444', creature: 'bird' },
  // 1 - Lavender Dream — silvery purple with violet blooms
  { base: '#4a4060', light: '#5e5578', dark: '#352848', berry: '#9060c0', flower: '#d8c0f0', accent: '#b888e0', creature: 'butterfly' },
  // 2 - Golden Autumn — warm amber and orange tones
  { base: '#6a5530', light: '#7a6540', dark: '#4a3818', berry: '#d08020', flower: '#f8e8a0', accent: '#e8a030', creature: 'squirrel' },
  // 3 - Ocean Mist — teal-blue with white flowers
  { base: '#2a5050', light: '#3a6565', dark: '#1a3838', berry: '#40a0a0', flower: '#e0f0f0', accent: '#60c0c0', creature: 'dragonfly' },
  // 4 - Rose Garden — deep green with pink blooms
  { base: '#305030', light: '#406040', dark: '#203820', berry: '#d04070', flower: '#f8c0d8', accent: '#e07098', creature: 'ladybug' },
  // 5 - Sunflower — bright green with golden yellow flowers
  { base: '#3a6a28', light: '#4a7a38', dark: '#285018', berry: '#d0a020', flower: '#f8e860', accent: '#e8c030', creature: 'bee' },
  // 6 - Blueberry — cool blue-green with indigo berries
  { base: '#304858', light: '#405868', dark: '#203040', berry: '#4848a0', flower: '#c8d0f0', accent: '#6060c0', creature: 'snail' },
  // 7 - Wildfire — dark charcoal with fiery orange-red
  { base: '#3a3830', light: '#4a4840', dark: '#282520', berry: '#e05020', flower: '#f8d0a0', accent: '#f07030', creature: 'firefly' },
  // 8 - Moss & Fern — rich forest green with cream accents
  { base: '#2a5a2a', light: '#3a6a38', dark: '#1a4018', berry: '#70a050', flower: '#f0f0d8', accent: '#90c070', creature: 'rabbit' },
  // 9 - Twilight — dusky plum with soft peach blooms
  { base: '#483848', light: '#584858', dark: '#302030', berry: '#c07060', flower: '#f0d8c8', accent: '#d89080', creature: 'hedgehog' },
]

/** Bush SVG for pomodoro completions */
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
      style={{ overflow: 'hidden' }}
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

// ── Tiny (< 15 min) ──────────────────────────────────

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

// ── Small (15-29 min) ────────────────────────────────

function SmallBush({ p }: { p: BushPalette }) {
  return (
    <g>
      <ellipse cx="18" cy="21" rx="9" ry="6" fill={p.dark} />
      <ellipse cx="16" cy="19" rx="6" ry="5" fill={p.base} />
      <ellipse cx="20" cy="19" rx="6" ry="5" fill={p.base} />
      <ellipse cx="18" cy="17.5" rx="5" ry="3.5" fill={p.light} />
      {/* Berries / flowers */}
      <circle cx="13" cy="20" r="1.3" fill={p.berry} />
      <circle cx="23" cy="19" r="1.3" fill={p.berry} />
      <circle cx="18" cy="16" r="1.3" fill={p.berry} opacity="0.9" />
      {/* Small flower */}
      <circle cx="15" cy="17" r="1.5" fill={p.flower} opacity="0.7" />
      <circle cx="15" cy="17" r="0.5" fill={p.accent} opacity="0.8" />
    </g>
  )
}

// ── Medium (30-59 min) ───────────────────────────────

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
      {/* Creature */}
      <Creature type={p.creature} x={27} y={11} size="sm" p={p} />
    </g>
  )
}

// ── Large (60+ min) ──────────────────────────────────

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
      {/* Creatures */}
      <Creature type={p.creature} x={25} y={9} size="lg" p={p} />
      <Creature type="butterfly" x={7} y={12} size="sm" p={p} />
    </g>
  )
}

// ── Creatures ────────────────────────────────────────

interface CreatureProps {
  type: string
  x: number
  y: number
  size: 'sm' | 'lg'
  p: BushPalette
}

function Creature({ type, x, y, size, p }: CreatureProps) {
  const s = size === 'lg' ? 1.2 : 0.85

  switch (type) {
    case 'butterfly':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`} className="animate-breathe" style={{ transformOrigin: `${x}px ${y}px` }}>
          <ellipse cx="-2" cy="0" rx="2.2" ry="1.5" fill={p.flower} opacity="0.8" transform="rotate(-20)" />
          <ellipse cx="2" cy="0" rx="2.2" ry="1.5" fill={p.accent} opacity="0.7" transform="rotate(20)" />
          <ellipse cx="0" cy="0" rx="0.4" ry="1.2" fill={p.dark} />
          <circle cx="-0.3" cy="-1" r="0.3" fill={p.dark} />
        </g>
      )

    case 'ladybug':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          <ellipse cx="0" cy="0" rx="2.2" ry="1.8" fill="#cc2020" />
          <circle cx="-0.8" cy="-0.3" r="0.5" fill="#1a1a1a" />
          <circle cx="0.8" cy="0.3" r="0.5" fill="#1a1a1a" />
          <circle cx="-0.2" cy="0.6" r="0.4" fill="#1a1a1a" />
          <line x1="-0.2" y1="-1.8" x2="0.2" y2="1.8" stroke="#1a1a1a" strokeWidth="0.4" />
          <circle cx="0" cy="-1.6" r="0.9" fill="#1a1a1a" />
          <circle cx="-0.3" cy="-1.8" r="0.2" fill="white" />
        </g>
      )

    case 'bird':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          <ellipse cx="0" cy="0" rx="2.2" ry="1.5" fill="#8B7355" />
          <circle cx="-1.8" cy="-0.8" r="1.1" fill="#9B8365" />
          <path d="M-2.9,-0.8 L-3.6,-0.5 L-2.9,-0.5Z" fill="#E8A040" />
          <circle cx="-2.1" cy="-1" r="0.35" fill="#2a2a2a" />
          <path d="M1.5,0 Q3,-1.5 3.5,-0.5 Q3,0.5 1.5,0Z" fill="#7A6345" />
          {/* Breast patch */}
          <ellipse cx="-0.5" cy="0.4" rx="1" ry="0.8" fill="#c8956a" opacity="0.6" />
        </g>
      )

    case 'squirrel':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          {/* Tail */}
          <path d="M1.5,-0.5 Q4,-3 3.5,0 Q3,2 1.5,0.5Z" fill="#a07040" />
          {/* Body */}
          <ellipse cx="0" cy="0.3" rx="2" ry="1.5" fill="#8a6030" />
          {/* Head */}
          <circle cx="-1.8" cy="-0.3" r="1.2" fill="#906838" />
          {/* Ear */}
          <ellipse cx="-2.2" cy="-1.3" rx="0.5" ry="0.7" fill="#906838" />
          {/* Eye */}
          <circle cx="-2" cy="-0.4" r="0.35" fill="#1a1a1a" />
          {/* Acorn */}
          <ellipse cx="-2.8" cy="0.5" rx="0.5" ry="0.6" fill="#b08040" />
          <rect x="-3.2" y="0" width="0.9" height="0.3" rx="0.1" fill="#806030" />
        </g>
      )

    case 'dragonfly':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`} className="animate-breathe" style={{ transformOrigin: `${x}px ${y}px` }}>
          {/* Wings */}
          <ellipse cx="-1.5" cy="-1" rx="3" ry="0.8" fill={p.accent} opacity="0.35" transform="rotate(-10)" />
          <ellipse cx="-1.5" cy="1" rx="3" ry="0.8" fill={p.accent} opacity="0.35" transform="rotate(10)" />
          <ellipse cx="0.5" cy="-0.5" rx="2" ry="0.6" fill={p.flower} opacity="0.3" transform="rotate(-5)" />
          <ellipse cx="0.5" cy="0.5" rx="2" ry="0.6" fill={p.flower} opacity="0.3" transform="rotate(5)" />
          {/* Body */}
          <ellipse cx="0" cy="0" rx="0.5" ry="0.7" fill={p.dark} />
          <line x1="0.5" y1="0" x2="3.5" y2="0" stroke={p.dark} strokeWidth="0.5" />
          {/* Eyes */}
          <circle cx="-0.3" cy="-0.5" r="0.4" fill="#50a0a0" />
          <circle cx="-0.3" cy="0.5" r="0.4" fill="#50a0a0" />
        </g>
      )

    case 'snail':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          {/* Body */}
          <ellipse cx="0" cy="0.8" rx="2.5" ry="0.8" fill="#b0a080" />
          {/* Shell */}
          <circle cx="0.5" cy="-0.2" r="1.8" fill={p.accent} opacity="0.6" />
          <circle cx="0.7" cy="-0.3" r="1.2" fill={p.flower} opacity="0.5" />
          <circle cx="0.8" cy="-0.3" r="0.6" fill={p.accent} opacity="0.4" />
          {/* Eye stalks */}
          <line x1="-1.8" y1="0.3" x2="-2.5" y2="-0.8" stroke="#b0a080" strokeWidth="0.3" strokeLinecap="round" />
          <line x1="-1.3" y1="0.3" x2="-1.8" y2="-0.6" stroke="#b0a080" strokeWidth="0.3" strokeLinecap="round" />
          <circle cx="-2.5" cy="-0.8" r="0.3" fill="#2a2a2a" />
          <circle cx="-1.8" cy="-0.6" r="0.25" fill="#2a2a2a" />
        </g>
      )

    case 'bee':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`} className="animate-breathe" style={{ transformOrigin: `${x}px ${y}px` }}>
          {/* Wings */}
          <ellipse cx="0" cy="-1.2" rx="1.8" ry="1" fill="rgba(255,255,255,0.4)" transform="rotate(-15)" />
          <ellipse cx="0.8" cy="-1" rx="1.5" ry="0.8" fill="rgba(255,255,255,0.3)" transform="rotate(15)" />
          {/* Body */}
          <ellipse cx="0" cy="0" rx="1.5" ry="1.8" fill="#e8c020" />
          <rect x="-1.5" y="-0.3" width="3" height="0.5" rx="0.2" fill="#2a2a2a" />
          <rect x="-1.5" y="0.5" width="3" height="0.5" rx="0.2" fill="#2a2a2a" />
          {/* Head */}
          <circle cx="0" cy="-1.6" r="0.8" fill="#2a2a2a" />
          {/* Eyes */}
          <circle cx="-0.3" cy="-1.7" r="0.25" fill="white" />
          <circle cx="0.3" cy="-1.7" r="0.25" fill="white" />
        </g>
      )

    case 'rabbit':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          {/* Body */}
          <ellipse cx="0" cy="0.5" rx="2" ry="1.5" fill="#d0c0a8" />
          {/* Head */}
          <circle cx="-1.5" cy="-0.5" r="1.3" fill="#d8c8b0" />
          {/* Ears */}
          <ellipse cx="-2" cy="-2.2" rx="0.5" ry="1.3" fill="#d8c8b0" transform="rotate(-10, -2, -2.2)" />
          <ellipse cx="-2" cy="-2.2" rx="0.3" ry="1" fill="#e8b8a8" opacity="0.6" transform="rotate(-10, -2, -2.2)" />
          <ellipse cx="-1" cy="-2" rx="0.5" ry="1.2" fill="#d8c8b0" transform="rotate(10, -1, -2)" />
          <ellipse cx="-1" cy="-2" rx="0.3" ry="0.9" fill="#e8b8a8" opacity="0.6" transform="rotate(10, -1, -2)" />
          {/* Eye */}
          <circle cx="-1.8" cy="-0.6" r="0.3" fill="#2a2a2a" />
          {/* Nose */}
          <ellipse cx="-2.5" cy="-0.2" rx="0.25" ry="0.2" fill="#e0a0a0" />
          {/* Tail */}
          <circle cx="1.8" cy="0" r="0.7" fill="#e0d8c8" />
        </g>
      )

    case 'hedgehog':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          {/* Spines */}
          <ellipse cx="0.5" cy="-0.3" rx="2.5" ry="2" fill="#7a6a50" />
          {/* Spine texture */}
          <path d="M-1,-1.5 L-0.5,-2.5 L0,-1.5" fill="#6a5a40" />
          <path d="M0.5,-1.5 L1,-2.5 L1.5,-1.5" fill="#6a5a40" />
          <path d="M2,-1 L2.5,-2 L3,-1" fill="#6a5a40" />
          <path d="M-0.5,-0.5 L0,-1.8 L0.5,-0.5" fill="#6a5a40" />
          <path d="M1.5,-0.5 L2,-1.8 L2.5,-0.5" fill="#6a5a40" />
          {/* Face */}
          <ellipse cx="-1.5" cy="0.3" rx="1.3" ry="1.1" fill="#c8b8a0" />
          {/* Eye */}
          <circle cx="-1.8" cy="0" r="0.3" fill="#1a1a1a" />
          {/* Nose */}
          <circle cx="-2.5" cy="0.4" r="0.35" fill="#2a2a2a" />
          {/* Belly */}
          <ellipse cx="0" cy="1" rx="2" ry="0.8" fill="#d0c0a8" />
        </g>
      )

    case 'firefly':
      return (
        <g transform={`translate(${x}, ${y}) scale(${s})`} className="animate-breathe" style={{ transformOrigin: `${x}px ${y}px` }}>
          {/* Wings */}
          <ellipse cx="-1" cy="-0.5" rx="1.5" ry="0.8" fill="rgba(255,255,255,0.25)" transform="rotate(-20)" />
          <ellipse cx="1" cy="-0.5" rx="1.5" ry="0.8" fill="rgba(255,255,255,0.25)" transform="rotate(20)" />
          {/* Body */}
          <ellipse cx="0" cy="0" rx="0.8" ry="1.3" fill="#4a4030" />
          {/* Glow */}
          <circle cx="0" cy="1" r="1.2" fill="#f0e860" opacity="0.3" />
          <circle cx="0" cy="0.8" r="0.7" fill="#f8f060" opacity="0.6" />
          {/* Head */}
          <circle cx="0" cy="-1.2" r="0.5" fill="#3a3020" />
        </g>
      )

    default:
      return null
  }
}
