import type { PlantHealth } from '../../types'

interface Props {
  stage: 0 | 1 | 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg'
  colorVariant?: number
  health?: PlantHealth
}

interface Palette {
  stem: string
  leaf: string
  leafLight: string
  flower: string
  center: string
  trunk: string
  canopyDark: string
  canopyLight: string
}

const PALETTES: Palette[] = [
  // 0 - Sage (default)
  { stem: '#788764', leaf: '#95a383', leafLight: '#b3bda3', flower: '#e8b4a8', center: '#c97b6b', trunk: '#4a5440', canopyDark: '#788764', canopyLight: '#95a383' },
  // 1 - Teal
  { stem: '#4a7c6f', leaf: '#6b9e8a', leafLight: '#8ebba8', flower: '#a8d4e8', center: '#5ba3c9', trunk: '#3a5e54', canopyDark: '#4a7c6f', canopyLight: '#6b9e8a' },
  // 2 - Lavender
  { stem: '#6b5e7a', leaf: '#8e83a3', leafLight: '#a89ebb', flower: '#d4b4e8', center: '#9b6bc9', trunk: '#524660', canopyDark: '#6b5e7a', canopyLight: '#8e83a3' },
  // 3 - Golden
  { stem: '#7a6b4a', leaf: '#a39566', leafLight: '#bfb183', flower: '#e8d4a8', center: '#c9a36b', trunk: '#5e5238', canopyDark: '#7a6b4a', canopyLight: '#a39566' },
  // 4 - Rose
  { stem: '#7a4a5e', leaf: '#a36683', leafLight: '#bb839e', flower: '#e8a8c4', center: '#c96b8e', trunk: '#5e3848', canopyDark: '#7a4a5e', canopyLight: '#a36683' },
]

const SIZES = { sm: 48, md: 80, lg: 120 }

const HEALTH_CLASSES: Record<PlantHealth, string> = {
  healthy: '',
  wilting: 'plant-wilting',
  sick: 'plant-sick',
  withered: 'plant-withered',
}

export default function PlantSVG({ stage, size = 'md', colorVariant = 0, health = 'healthy' }: Props) {
  const s = SIZES[size]
  const vb = '0 0 48 48'
  const p = PALETTES[colorVariant] ?? PALETTES[0]
  const healthClass = HEALTH_CLASSES[health]
  const filterId = health !== 'healthy' ? `health-${health}` : undefined

  return (
    <svg
      width={s}
      height={s}
      viewBox={vb}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-plant-grow ${healthClass}`}
    >
      {filterId && (
        <defs>
          {health === 'wilting' && (
            <filter id={filterId}>
              <feColorMatrix type="saturate" values="0.75" />
            </filter>
          )}
          {health === 'sick' && (
            <filter id={filterId}>
              <feColorMatrix type="saturate" values="0.45" />
              <feColorMatrix type="matrix" values="1.1 0.1 0 0 0.05  0.05 1.05 0 0 0.03  0 0 0.85 0 0  0 0 0 1 0" />
            </filter>
          )}
          {health === 'withered' && (
            <filter id={filterId}>
              <feColorMatrix type="saturate" values="0.2" />
              <feColorMatrix type="matrix" values="1.15 0.15 0 0 0.08  0.1 1.0 0 0 0.04  0 0 0.7 0 0  0 0 0 1 0" />
            </filter>
          )}
        </defs>
      )}

      <g filter={filterId ? `url(#${filterId})` : undefined}>
        {/* Soil line */}
        <line x1="8" y1="42" x2="40" y2="42" stroke="#a8977a" strokeWidth="1.5" strokeLinecap="round" />

        {stage === 0 && <SeedStage />}
        {stage === 1 && <SproutStage p={p} />}
        {stage === 2 && <SaplingStage p={p} />}
        {stage === 3 && <BloomStage p={p} />}
        {stage === 4 && <TreeStage p={p} />}
      </g>
    </svg>
  )
}

/** Stage 0: Small brown seed in soil, subtle pulse */
function SeedStage() {
  return (
    <g className="animate-breathe" style={{ transformOrigin: '24px 40px' }}>
      <ellipse cx="24" cy="40" rx="3.5" ry="2.5" fill="#a8977a" />
      <ellipse cx="24" cy="39.5" rx="2.5" ry="1.8" fill="#c4a882" />
    </g>
  )
}

/** Stage 1: Thin stem + 2 small leaves, gentle sway */
function SproutStage({ p }: { p: Palette }) {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
      <line x1="24" y1="42" x2="24" y2="32" stroke={p.leaf} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 35 Q20 32 19 34 Q20 36 24 35Z" fill={p.leaf} />
      <path d="M24 33 Q28 30 29 32 Q28 34 24 33Z" fill={p.leafLight} />
    </g>
  )
}

/** Stage 2: Taller stem + 4 leaves */
function SaplingStage({ p }: { p: Palette }) {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
      <line x1="24" y1="42" x2="24" y2="24" stroke={p.stem} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 36 Q19 33 17 35 Q19 38 24 36Z" fill={p.leaf} />
      <path d="M24 36 Q29 33 31 35 Q29 38 24 36Z" fill={p.leaf} />
      <path d="M24 29 Q19 26 18 28 Q20 31 24 29Z" fill={p.stem} />
      <path d="M24 29 Q29 26 30 28 Q28 31 24 29Z" fill={p.stem} />
    </g>
  )
}

/** Stage 3: Full stem + leaves + flower */
function BloomStage({ p }: { p: Palette }) {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
      <line x1="24" y1="42" x2="24" y2="18" stroke={p.trunk} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 36 Q18 33 16 35 Q18 38 24 36Z" fill={p.leaf} />
      <path d="M24 36 Q30 33 32 35 Q30 38 24 36Z" fill={p.leaf} />
      <path d="M24 28 Q18 25 17 27 Q19 30 24 28Z" fill={p.stem} />
      <path d="M24 28 Q30 25 31 27 Q29 30 24 28Z" fill={p.stem} />
      <circle cx="24" cy="16" r="2" fill={p.flower} />
      <circle cx="21" cy="17.5" r="1.8" fill={p.flower} opacity="0.8" />
      <circle cx="27" cy="17.5" r="1.8" fill={p.flower} opacity="0.8" />
      <circle cx="22.5" cy="14.5" r="1.8" fill={p.flower} opacity="0.8" />
      <circle cx="25.5" cy="14.5" r="1.8" fill={p.flower} opacity="0.8" />
      <circle cx="24" cy="16" r="1.2" fill={p.center} />
    </g>
  )
}

/** Stage 4: Thick trunk + rounded canopy */
function TreeStage({ p }: { p: Palette }) {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
      <line x1="24" y1="42" x2="24" y2="22" stroke={p.trunk} strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="30" x2="19" y2="26" stroke={p.trunk} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="30" x2="29" y2="26" stroke={p.trunk} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="16" r="10" fill={p.canopyDark} opacity="0.7" />
      <circle cx="20" cy="18" r="7" fill={p.canopyLight} opacity="0.6" />
      <circle cx="28" cy="18" r="7" fill={p.canopyLight} opacity="0.6" />
      <circle cx="24" cy="13" r="8" fill={p.canopyDark} opacity="0.5" />
    </g>
  )
}
