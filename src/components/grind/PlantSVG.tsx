interface Props {
  stage: 0 | 1 | 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 48, md: 80, lg: 120 }

export default function PlantSVG({ stage, size = 'md' }: Props) {
  const s = SIZES[size]
  const vb = '0 0 48 48'

  return (
    <svg width={s} height={s} viewBox={vb} fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-plant-grow">
      {/* Soil line */}
      <line x1="8" y1="42" x2="40" y2="42" stroke="#a8977a" strokeWidth="1.5" strokeLinecap="round" />

      {stage === 0 && <SeedStage />}
      {stage === 1 && <SproutStage />}
      {stage === 2 && <SaplingStage />}
      {stage === 3 && <BloomStage />}
      {stage === 4 && <TreeStage />}
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
function SproutStage() {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
      {/* Stem */}
      <line x1="24" y1="42" x2="24" y2="32" stroke="#95a383" strokeWidth="1.5" strokeLinecap="round" />
      {/* Left leaf */}
      <path d="M24 35 Q20 32 19 34 Q20 36 24 35Z" fill="#95a383" />
      {/* Right leaf */}
      <path d="M24 33 Q28 30 29 32 Q28 34 24 33Z" fill="#b3bda3" />
    </g>
  )
}

/** Stage 2: Taller stem + 4 leaves */
function SaplingStage() {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
      {/* Stem */}
      <line x1="24" y1="42" x2="24" y2="24" stroke="#788764" strokeWidth="2" strokeLinecap="round" />
      {/* Lower leaves */}
      <path d="M24 36 Q19 33 17 35 Q19 38 24 36Z" fill="#95a383" />
      <path d="M24 36 Q29 33 31 35 Q29 38 24 36Z" fill="#95a383" />
      {/* Upper leaves */}
      <path d="M24 29 Q19 26 18 28 Q20 31 24 29Z" fill="#788764" />
      <path d="M24 29 Q29 26 30 28 Q28 31 24 29Z" fill="#788764" />
    </g>
  )
}

/** Stage 3: Full stem + leaves + flower */
function BloomStage() {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
      {/* Stem */}
      <line x1="24" y1="42" x2="24" y2="18" stroke="#5e6b4e" strokeWidth="2" strokeLinecap="round" />
      {/* Lower leaves */}
      <path d="M24 36 Q18 33 16 35 Q18 38 24 36Z" fill="#95a383" />
      <path d="M24 36 Q30 33 32 35 Q30 38 24 36Z" fill="#95a383" />
      {/* Mid leaves */}
      <path d="M24 28 Q18 25 17 27 Q19 30 24 28Z" fill="#788764" />
      <path d="M24 28 Q30 25 31 27 Q29 30 24 28Z" fill="#788764" />
      {/* Flower petals (terracotta-light) */}
      <circle cx="24" cy="16" r="2" fill="#e8b4a8" />
      <circle cx="21" cy="17.5" r="1.8" fill="#e8b4a8" opacity="0.8" />
      <circle cx="27" cy="17.5" r="1.8" fill="#e8b4a8" opacity="0.8" />
      <circle cx="22.5" cy="14.5" r="1.8" fill="#e8b4a8" opacity="0.8" />
      <circle cx="25.5" cy="14.5" r="1.8" fill="#e8b4a8" opacity="0.8" />
      {/* Center */}
      <circle cx="24" cy="16" r="1.2" fill="#c97b6b" />
    </g>
  )
}

/** Stage 4: Thick trunk + rounded canopy */
function TreeStage() {
  return (
    <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
      {/* Trunk */}
      <line x1="24" y1="42" x2="24" y2="22" stroke="#4a5440" strokeWidth="3" strokeLinecap="round" />
      {/* Small branches */}
      <line x1="24" y1="30" x2="19" y2="26" stroke="#4a5440" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="30" x2="29" y2="26" stroke="#4a5440" strokeWidth="1.5" strokeLinecap="round" />
      {/* Canopy - layered circles */}
      <circle cx="24" cy="16" r="10" fill="#788764" opacity="0.7" />
      <circle cx="20" cy="18" r="7" fill="#95a383" opacity="0.6" />
      <circle cx="28" cy="18" r="7" fill="#95a383" opacity="0.6" />
      <circle cx="24" cy="13" r="8" fill="#788764" opacity="0.5" />
    </g>
  )
}
