import type { PlantHealth } from '../../types'

interface Props {
  stage: 0 | 1 | 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg'
  colorVariant?: number
  health?: PlantHealth
}

interface Palette {
  soil: string
  stem: string
  leaf: string
  leafLight: string
  leafShadow: string
  flower: string
  center: string
  trunk: string
  canopy: string
  canopyLight: string
  canopyShadow: string
}

// Harmonious palettes — muted, natural, calming
const PALETTES: Palette[] = [
  // 0 - Sage (default) — the heart of the app
  { soil: '#a89878', stem: '#7a8a6a', leaf: '#8fa37d', leafLight: '#a8b898', leafShadow: '#6b7d5e',
    flower: '#dcc0b0', center: '#c49a85', trunk: '#5e6850', canopy: '#7d9070', canopyLight: '#98ab8a', canopyShadow: '#647558' },
  // 1 - Seafoam — cool and contemplative
  { soil: '#8a9488', stem: '#5a7a70', leaf: '#6d9585', leafLight: '#88ada0', leafShadow: '#4a6a5e',
    flower: '#b0d0d0', center: '#7aadad', trunk: '#486058', canopy: '#5e8878', canopyLight: '#78a295', canopyShadow: '#4a705e' },
  // 2 - Lavender — soft and spiritual
  { soil: '#9a9098', stem: '#6a6078', leaf: '#807598', leafLight: '#9a90ad', leafShadow: '#5a5068',
    flower: '#c8b8d8', center: '#9880b0', trunk: '#554a62', canopy: '#706580', canopyLight: '#8a80a0', canopyShadow: '#5a4e6a' },
  // 3 - Amber — warm and grounding
  { soil: '#a89070', stem: '#7a7050', leaf: '#908058', leafLight: '#a8986e', leafShadow: '#686048',
    flower: '#dcc8a0', center: '#c0a070', trunk: '#605840', canopy: '#7a7048', canopyLight: '#95885e', canopyShadow: '#605838' },
  // 4 - Rose — gentle warmth
  { soil: '#a08880', stem: '#785a60', leaf: '#907078', leafLight: '#a88890', leafShadow: '#685058',
    flower: '#d8b0b8', center: '#c08890', trunk: '#5e4448', canopy: '#7a6068', canopyLight: '#957880', canopyShadow: '#604850' },
]

const SIZES = { sm: 48, md: 80, lg: 120 }

const DROOP: Record<PlantHealth, number> = {
  healthy: 0, wilting: 3, sick: 5, withered: 8,
}

export default function PlantSVG({ stage, size = 'md', colorVariant = 0, health = 'healthy' }: Props) {
  const s = SIZES[size]
  const p = PALETTES[colorVariant % PALETTES.length]
  const filterId = health !== 'healthy' ? `health-${health}-${colorVariant}` : undefined
  const dir = colorVariant % 2 === 0 ? 1 : -1
  const droop = DROOP[health]
  const droopStyle = droop > 0
    ? { transform: `rotate(${droop * dir}deg)`, transformOrigin: '24px 44px' } as React.CSSProperties
    : undefined

  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-plant-grow">
      {filterId && (
        <defs>
          {health === 'wilting' && <filter id={filterId}><feColorMatrix type="saturate" values="0.7" /></filter>}
          {health === 'sick' && <filter id={filterId}><feColorMatrix type="saturate" values="0.4" /><feColorMatrix type="matrix" values="1.1 0.1 0 0 0.05  0.05 1.05 0 0 0.03  0 0 0.85 0 0  0 0 0 1 0" /></filter>}
          {health === 'withered' && <filter id={filterId}><feColorMatrix type="saturate" values="0.15" /><feColorMatrix type="matrix" values="1.1 0.15 0 0 0.08  0.1 1.0 0 0 0.04  0 0 0.7 0 0  0 0 0 1 0" /></filter>}
        </defs>
      )}

      {/* Soft ground shadow */}
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(0,0,0,0.06)" />

      <g filter={filterId ? `url(#${filterId})` : undefined} style={droopStyle}>
        {stage === 0 && <Seed p={p} />}
        {stage === 1 && <Sprout p={p} />}
        {stage === 2 && <Sapling p={p} />}
        {stage === 3 && <Bloom p={p} />}
        {stage === 4 && <Tree p={p} />}
      </g>
    </svg>
  )
}

// ── Stage 0: Seed — a gentle promise ──────────────────────
function Seed({ p }: { p: Palette }) {
  return (
    <g className="animate-breathe" style={{ transformOrigin: '24px 42px' }}>
      {/* Soil mound */}
      <ellipse cx="24" cy="42" rx="8" ry="3" fill={p.soil} opacity="0.4" />
      <ellipse cx="24" cy="41" rx="6" ry="2" fill={p.soil} opacity="0.3" />
      {/* Seed */}
      <ellipse cx="24" cy="40" rx="3" ry="2.2" fill={p.soil} />
      <ellipse cx="23.5" cy="39.5" rx="2" ry="1.5" fill={p.stem} opacity="0.4" />
    </g>
  )
}

// ── Stage 1: Sprout — first breath ────────────────────────
function Sprout({ p }: { p: Palette }) {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 44px' }}>
      {/* Soil */}
      <ellipse cx="24" cy="43" rx="6" ry="2" fill={p.soil} opacity="0.3" />
      {/* Stem — slightly curved, not straight */}
      <path d="M24,43 Q23.5,38 24,33" stroke={p.stem} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Two leaves — asymmetric, soft Q-curves */}
      <path d="M24,37 Q19,34 18,36 Q19.5,38.5 24,37Z" fill={p.leaf} />
      <path d="M24,35 Q28.5,32 29.5,34 Q28,36.5 24,35Z" fill={p.leafLight} />
      {/* Leaf veins — whisper thin */}
      <path d="M24,37 Q21,35.5 19,36" stroke={p.leafShadow} strokeWidth="0.3" fill="none" opacity="0.5" />
    </g>
  )
}

// ── Stage 2: Sapling — growing confidence ─────────────────
function Sapling({ p }: { p: Palette }) {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 44px' }}>
      <ellipse cx="24" cy="43" rx="7" ry="2.5" fill={p.soil} opacity="0.25" />
      {/* Stem with gentle curve */}
      <path d="M24,43 Q23,36 24,26" stroke={p.stem} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Four leaves — alternating sides, organic shapes */}
      <path d="M24,38 Q18,35 16.5,37 Q18,40 24,38Z" fill={p.leaf} />
      <path d="M24,37 Q30,34 31.5,36 Q30,39 24,37Z" fill={p.leafLight} />
      <path d="M24,31 Q18.5,28 17.5,30 Q19,33 24,31Z" fill={p.leafShadow} opacity="0.7" />
      <path d="M24,30 Q29,27 30.5,29 Q29,32 24,30Z" fill={p.leaf} opacity="0.8" />
      {/* Veins */}
      <path d="M24,38 Q20.5,36.5 17.5,37" stroke={p.leafShadow} strokeWidth="0.3" fill="none" opacity="0.4" />
      <path d="M24,31 Q21,29.5 18.5,30" stroke={p.leafShadow} strokeWidth="0.3" fill="none" opacity="0.3" />
    </g>
  )
}

// ── Stage 3: Bloom — the reward of patience ───────────────
function Bloom({ p }: { p: Palette }) {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 44px' }}>
      <ellipse cx="24" cy="43" rx="8" ry="2.5" fill={p.soil} opacity="0.2" />
      {/* Main stem — gentle S-curve */}
      <path d="M24,43 Q23,35 23.5,28 Q24,22 24,18" stroke={p.trunk} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Side branch */}
      <path d="M24,32 Q20,29 18,27" stroke={p.trunk} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Leaves — lush but not cluttered */}
      <path d="M24,38 Q17,35 15.5,37 Q17.5,40 24,38Z" fill={p.leaf} />
      <path d="M24,36 Q31,33 32.5,35 Q30.5,38 24,36Z" fill={p.leafLight} />
      <path d="M24,30 Q18,27 17,29 Q19,32 24,30Z" fill={p.leafShadow} opacity="0.7" />
      <path d="M18,27 Q15,24 14,26 Q15.5,28.5 18,27Z" fill={p.leaf} opacity="0.8" />
      {/* Flower — soft layered petals */}
      <ellipse cx="24" cy="16" rx="3.5" ry="4" fill={p.flower} opacity="0.7" />
      <ellipse cx="21" cy="17.5" rx="3" ry="3.5" fill={p.flower} opacity="0.6" transform="rotate(-15 21 17.5)" />
      <ellipse cx="27" cy="17.5" rx="3" ry="3.5" fill={p.flower} opacity="0.6" transform="rotate(15 27 17.5)" />
      <ellipse cx="22.5" cy="14" rx="2.8" ry="3.2" fill={p.flower} opacity="0.5" transform="rotate(-8 22.5 14)" />
      <ellipse cx="25.5" cy="14" rx="2.8" ry="3.2" fill={p.flower} opacity="0.5" transform="rotate(8 25.5 14)" />
      {/* Center — warm heart */}
      <circle cx="24" cy="16" r="2" fill={p.center} opacity="0.8" />
      <circle cx="24" cy="16" r="1" fill={p.flower} opacity="0.5" />
    </g>
  )
}

// ── Stage 4: Tree — quiet strength ────────────────────────
function Tree({ p }: { p: Palette }) {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 44px' }}>
      <ellipse cx="24" cy="43.5" rx="10" ry="2.5" fill={p.soil} opacity="0.15" />
      {/* Trunk — tapered, with character */}
      <path d="M24,44 Q23.5,38 23,32 Q23,28 24,24" stroke={p.trunk} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Branches — organic, asymmetric */}
      <path d="M24,30 Q19,27 16,24" stroke={p.trunk} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M24,28 Q28,25 31,23" stroke={p.trunk} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M24,34 Q20,32 18,30" stroke={p.trunk} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Canopy — overlapping soft circles, asymmetric placement */}
      <circle cx="22" cy="18" r="8" fill={p.canopyShadow} opacity="0.5" />
      <circle cx="28" cy="17" r="7" fill={p.canopy} opacity="0.5" />
      <circle cx="18" cy="15" r="6.5" fill={p.canopy} opacity="0.45" />
      <circle cx="25" cy="12" r="7.5" fill={p.canopyLight} opacity="0.45" />
      <circle cx="20" cy="20" r="5" fill={p.canopyShadow} opacity="0.3" />
      {/* Light dapples — suggests sunlight through leaves */}
      <circle cx="22" cy="14" r="2" fill={p.canopyLight} opacity="0.25" />
      <circle cx="27" cy="18" r="1.5" fill={p.canopyLight} opacity="0.2" />
    </g>
  )
}
