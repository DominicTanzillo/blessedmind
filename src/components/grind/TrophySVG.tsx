import { type ReactElement } from 'react'

// ── Material palettes: Clay → Stone → Copper → Jade ──────────
// Not competitive rankings — natural aging progression.
// Clay is "just formed," Jade is "ancient and rare."
const PALETTES = [
  // Clay — warm, matte, earthen
  { primary: '#b07850', secondary: '#d4a882', dark: '#7a5235', accent: '#f0dcc8', glow: 'rgba(176,120,80,0.4)' },
  // Stone — cool, smooth, solid
  { primary: '#7a8878', secondary: '#a5b5a0', dark: '#4a5a48', accent: '#d0ddd0', glow: 'rgba(122,136,120,0.4)' },
  // Copper — warm metallic with green patina
  { primary: '#8a6e50', secondary: '#6db89a', dark: '#5a4030', accent: '#c8e8d8', glow: 'rgba(109,184,154,0.4)' },
  // Jade — deep, luminous, precious
  { primary: '#3a7a5a', secondary: '#68b898', dark: '#1a4a32', accent: '#e0f5ea', glow: 'rgba(58,122,90,0.5)' },
]

type Palette = typeof PALETTES[0]

const ARTIFACT_NAMES = [
  // Earth Treasures (0-3)
  'Geode', 'Amber Drop', 'Fossil Spiral', 'River Stone',
  // Zen Garden (4-7)
  'Stone Lantern', 'Cairn', 'Sand Garden', 'Bonsai',
  // Sacred Objects (8-11)
  'Singing Bowl', 'Prayer Beads', 'Incense Holder', 'Votive Candle',
  // Celestial (12-15)
  'Moon Phase', 'Constellation', 'Sunrise', 'Falling Leaf',
  // Artisan (16-17)
  'Kintsugi Bowl', 'Tea Bowl',
]

const PALETTE_NAMES = ['Clay', 'Stone', 'Copper', 'Jade']

function tierScale(tier: number): number {
  return [0, 0.75, 0.88, 1.0, 1.08][tier] ?? 1
}

type DrawFn = (p: Palette, tier: number) => ReactElement

// ═══════════════════════════════════════════════════════════════
// EARTH TREASURES — formed by pressure and time
// ═══════════════════════════════════════════════════════════════

const drawGeode: DrawFn = (p, tier) => (
  <g>
    {/* Rough outer shell */}
    <path d="M10,22 Q8,16 12,10 Q18,6 24,8 Q28,12 28,20 Q26,26 18,28 Q12,27 10,22Z" fill={p.dark} />
    <path d="M12,21 Q10,16 14,11 Q18,8 23,10 Q26,14 26,20 Q24,25 18,26 Q13,25 12,21Z" fill={p.primary} opacity="0.7" />
    {/* Crystal cavity — the revealed interior */}
    <path d="M14,20 Q13,16 16,13 Q19,11 22,13 Q24,16 23,20 Q21,23 17,23 Q14,22 14,20Z" fill={p.accent} opacity="0.6" />
    {/* Crystal points */}
    <line x1="16" y1="18" x2="15" y2="14" stroke={p.secondary} strokeWidth="1" strokeLinecap="round" />
    <line x1="19" y1="17" x2="18.5" y2="12.5" stroke={p.secondary} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="21" y1="18" x2="22" y2="14" stroke={p.secondary} strokeWidth="0.8" strokeLinecap="round" />
    {tier >= 2 && <line x1="17.5" y1="19" x2="17" y2="15" stroke={p.accent} strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />}
    {tier >= 3 && <>
      <line x1="20" y1="19" x2="20.5" y2="13.5" stroke={p.accent} strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
      <circle cx="18.5" cy="13" r="0.8" fill={p.accent} opacity="0.5" />
    </>}
    <ellipse cx="18" cy="29" rx="8" ry="1.5" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawAmber: DrawFn = (p, tier) => (
  <g>
    {/* Teardrop shape — warm translucency */}
    <path d="M18,6 Q12,14 12,22 Q12,28 18,30 Q24,28 24,22 Q24,14 18,6Z" fill={p.primary} opacity="0.65" />
    <path d="M18,8 Q14,15 14,22 Q14,27 18,28 Q22,27 22,22 Q22,15 18,8Z" fill={p.secondary} opacity="0.45" />
    {/* Internal highlight — suggests depth */}
    <ellipse cx="16.5" cy="16" rx="3" ry="4" fill={p.accent} opacity="0.25" transform="rotate(-10 16.5 16)" />
    {/* Tiny inclusion */}
    {tier >= 2 && <path d="M17,20 Q16,19 17,18 Q18,19 17,20Z" fill={p.dark} opacity="0.3" />}
    {tier >= 3 && <ellipse cx="19" cy="22" rx="1.5" ry="0.8" fill={p.dark} opacity="0.2" />}
    <ellipse cx="18" cy="31" rx="5" ry="1" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawFossil: DrawFn = (p, tier) => (
  <g>
    {/* Stone matrix */}
    <ellipse cx="18" cy="18" rx="12" ry="11" fill={p.dark} opacity="0.5" />
    <ellipse cx="18" cy="17.5" rx="10.5" ry="9.5" fill={p.primary} opacity="0.6" />
    {/* Ammonite spiral — the fossil itself */}
    <path d="M18,12 Q22,12 22,16 Q22,20 18,20 Q15,20 15,17 Q15,14 18,14 Q20,14 20,16 Q20,18 18,18" stroke={p.secondary} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {tier >= 2 && <path d="M18,16 Q19,16 19,17 Q19,18 18,18" stroke={p.accent} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />}
    {tier >= 3 && <>
      <circle cx="18" cy="17" r="0.8" fill={p.accent} opacity="0.5" />
      <path d="M14,22 Q18,21 22,22" stroke={p.secondary} strokeWidth="0.5" fill="none" opacity="0.4" />
    </>}
    <ellipse cx="18" cy="29" rx="8" ry="1.5" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawRiverStone: DrawFn = (p, tier) => (
  <g>
    {/* Smooth, asymmetric oval — water-worn perfection */}
    <ellipse cx="18" cy="20" rx="10" ry="8" fill={p.dark} opacity="0.5" transform="rotate(-5 18 20)" />
    <ellipse cx="17.5" cy="19.5" rx="9" ry="7" fill={p.primary} opacity="0.6" transform="rotate(-5 17.5 19.5)" />
    <ellipse cx="17" cy="19" rx="7" ry="5.5" fill={p.secondary} opacity="0.4" transform="rotate(-5 17 19)" />
    {/* Subtle banding */}
    {tier >= 2 && <path d="M10,20 Q18,18 26,20" stroke={p.accent} strokeWidth="0.5" fill="none" opacity="0.3" />}
    {tier >= 2 && <path d="M11,22 Q18,20 25,22" stroke={p.accent} strokeWidth="0.4" fill="none" opacity="0.25" />}
    {/* Wet sheen */}
    {tier >= 3 && <ellipse cx="15" cy="17" rx="3" ry="1.5" fill={p.accent} opacity="0.2" />}
    <ellipse cx="18" cy="28" rx="8" ry="1.5" fill="rgba(0,0,0,0.06)" />
  </g>
)

// ═══════════════════════════════════════════════════════════════
// ZEN GARDEN — placed with intention
// ═══════════════════════════════════════════════════════════════

const drawLantern: DrawFn = (p, tier) => (
  <g>
    {/* Base */}
    <rect x="14" y="28" width="8" height="2" rx="0.5" fill={p.dark} />
    {/* Pillar */}
    <rect x="16" y="20" width="4" height="8" rx="0.5" fill={p.primary} />
    {/* Fire box — warm glow window */}
    <rect x="13" y="16" width="10" height="5" rx="1" fill={p.dark} />
    <rect x="15" y="17.5" width="2.5" height="2" rx="0.3" fill={p.accent} opacity={tier >= 2 ? "0.7" : "0.4"} />
    <rect x="19" y="17.5" width="2.5" height="2" rx="0.3" fill={p.accent} opacity={tier >= 2 ? "0.6" : "0.35"} />
    {/* Roof cap */}
    <path d="M11,16 L18,10 L25,16Z" fill={p.primary} />
    <path d="M12,16 L18,11 L24,16Z" fill={p.secondary} opacity="0.5" />
    {tier >= 3 && <circle cx="18" cy="18" r="4" fill={p.accent} opacity="0.15" />}
    <ellipse cx="18" cy="31" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawCairn: DrawFn = (p, tier) => (
  <g>
    {/* Stacked stones — slightly off-center for wabi-sabi balance */}
    <ellipse cx="18" cy="28" rx="7" ry="3" fill={p.dark} opacity="0.5" />
    <ellipse cx="18" cy="27" rx="6.5" ry="2.5" fill={p.primary} />
    <ellipse cx="17.5" cy="23" rx="5" ry="2.2" fill={p.dark} opacity="0.5" />
    <ellipse cx="17.5" cy="22.5" rx="4.5" ry="2" fill={p.primary} opacity="0.9" />
    <ellipse cx="18.5" cy="19" rx="3.5" ry="1.8" fill={p.dark} opacity="0.5" />
    <ellipse cx="18.5" cy="18.5" rx="3" ry="1.5" fill={p.secondary} />
    {tier >= 2 && <>
      <ellipse cx="17.8" cy="15.5" rx="2.2" ry="1.2" fill={p.dark} opacity="0.5" />
      <ellipse cx="17.8" cy="15" rx="2" ry="1" fill={p.secondary} opacity="0.8" />
    </>}
    {tier >= 3 && <>
      <ellipse cx="18.2" cy="12.5" rx="1.5" ry="0.8" fill={p.accent} opacity="0.6" />
    </>}
    <ellipse cx="18" cy="30" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawSandGarden: DrawFn = (p, tier) => (
  <g>
    {/* Raked sand circle */}
    <ellipse cx="18" cy="20" rx="12" ry="10" fill={p.accent} opacity="0.3" />
    {/* Concentric rake lines */}
    <ellipse cx="18" cy="20" rx="10" ry="8" stroke={p.primary} strokeWidth="0.5" fill="none" opacity="0.4" />
    <ellipse cx="18" cy="20" rx="7.5" ry="6" stroke={p.primary} strokeWidth="0.5" fill="none" opacity="0.35" />
    <ellipse cx="18" cy="20" rx="5" ry="4" stroke={p.primary} strokeWidth="0.5" fill="none" opacity="0.3" />
    {/* Center stone */}
    <ellipse cx="18" cy="20" rx="2" ry="1.5" fill={p.dark} opacity="0.5" />
    <ellipse cx="17.5" cy="19.5" rx="1.5" ry="1" fill={p.primary} opacity="0.6" />
    {tier >= 2 && <ellipse cx="13" cy="22" rx="1.2" ry="0.8" fill={p.dark} opacity="0.3" />}
    {tier >= 3 && <ellipse cx="23" cy="18" rx="1" ry="0.7" fill={p.dark} opacity="0.25" />}
    <ellipse cx="18" cy="30" rx="10" ry="1.5" fill="rgba(0,0,0,0.04)" />
  </g>
)

const drawBonsai: DrawFn = (p, tier) => (
  <g>
    {/* Pot — rectangular, slightly irregular */}
    <rect x="12" y="26" width="12" height="4" rx="1" fill={p.dark} />
    <rect x="12.5" y="26.5" width="11" height="3" rx="0.8" fill={p.primary} opacity="0.7" />
    {/* Trunk — asymmetric, with character */}
    <path d="M18,26 Q16,22 14,18 Q13,15 15,13" stroke={p.dark} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M16,20 Q19,18 21,16" stroke={p.dark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {/* Canopy — soft, asymmetric */}
    <circle cx="14" cy="12" r={tier >= 2 ? 4.5 : 3.5} fill={p.secondary} opacity="0.5" />
    <circle cx="18" cy="14" r={tier >= 2 ? 3.5 : 2.5} fill={p.primary} opacity="0.4" />
    {tier >= 3 && <circle cx="21" cy="13" r="3" fill={p.secondary} opacity="0.35" />}
    <ellipse cx="18" cy="31" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
  </g>
)

// ═══════════════════════════════════════════════════════════════
// SACRED OBJECTS — used in contemplation
// ═══════════════════════════════════════════════════════════════

const drawSingingBowl: DrawFn = (p, tier) => (
  <g>
    {/* Bowl — wide, shallow half-ellipse */}
    <path d="M8,20 Q8,28 18,28 Q28,28 28,20" fill={p.dark} />
    <path d="M9,20 Q9,27 18,27 Q27,27 27,20" fill={p.primary} />
    <ellipse cx="18" cy="20" rx="10" ry="3" fill={p.secondary} opacity="0.5" />
    <ellipse cx="16" cy="19.5" rx="4" ry="1.2" fill={p.accent} opacity="0.25" />
    {/* Striker resting across */}
    <line x1="12" y1="18" x2="24" y2="17" stroke={p.dark} strokeWidth="1.5" strokeLinecap="round" />
    {/* Sound waves */}
    {tier >= 2 && <ellipse cx="18" cy="16" rx="6" ry="1.5" stroke={p.accent} strokeWidth="0.4" fill="none" opacity="0.3" />}
    {tier >= 3 && <>
      <ellipse cx="18" cy="14" rx="8" ry="2" stroke={p.accent} strokeWidth="0.3" fill="none" opacity="0.2" />
      <ellipse cx="18" cy="12" rx="10" ry="2.5" stroke={p.accent} strokeWidth="0.3" fill="none" opacity="0.15" />
    </>}
    <ellipse cx="18" cy="29" rx="9" ry="1.5" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawPrayerBeads: DrawFn = (p, tier) => (
  <g>
    {/* Circle of beads */}
    {Array.from({ length: tier >= 3 ? 16 : tier >= 2 ? 12 : 8 }).map((_, i, arr) => {
      const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2
      const r = tier >= 3 ? 9 : tier >= 2 ? 8 : 7
      const cx = 18 + Math.cos(angle) * r
      const cy = 17 + Math.sin(angle) * r
      return <circle key={i} cx={cx} cy={cy} r={1} fill={i === 0 ? p.accent : p.primary} opacity={0.7} />
    })}
    {/* Tassel */}
    <line x1="18" y1={17 + (tier >= 3 ? 9 : tier >= 2 ? 8 : 7)} x2="18" y2="30" stroke={p.secondary} strokeWidth="0.8" strokeLinecap="round" />
    <line x1="17" y1="29" x2="18" y2="31" stroke={p.secondary} strokeWidth="0.6" strokeLinecap="round" />
    <line x1="19" y1="29" x2="18" y2="31" stroke={p.secondary} strokeWidth="0.6" strokeLinecap="round" />
    <ellipse cx="18" cy="32" rx="3" ry="0.5" fill="rgba(0,0,0,0.04)" />
  </g>
)

const drawIncense: DrawFn = (p, tier) => (
  <g>
    {/* Dish */}
    <ellipse cx="18" cy="28" rx="7" ry="2.5" fill={p.dark} opacity="0.5" />
    <ellipse cx="18" cy="27.5" rx="6" ry="2" fill={p.primary} opacity="0.6" />
    {/* Incense stick */}
    <line x1="18" y1="27" x2="18" y2="14" stroke={p.dark} strokeWidth="0.8" strokeLinecap="round" />
    {/* Burning tip */}
    <circle cx="18" cy="14" r="1" fill={p.accent} opacity={tier >= 2 ? "0.7" : "0.5"} />
    {/* Smoke curl — organic, rises gently */}
    <path d="M18,13 Q16,10 18,8 Q20,6 18,4" stroke={p.secondary} strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.3" />
    {tier >= 2 && <path d="M18,12 Q20,9 18,7 Q16,5 17,3" stroke={p.secondary} strokeWidth="0.4" fill="none" strokeLinecap="round" opacity="0.2" />}
    {tier >= 3 && <path d="M18,11 Q15,8 17,5 Q19,3 18,1" stroke={p.accent} strokeWidth="0.3" fill="none" strokeLinecap="round" opacity="0.15" />}
    <ellipse cx="18" cy="30" rx="5" ry="1" fill="rgba(0,0,0,0.05)" />
  </g>
)

const drawCandle: DrawFn = (p, tier) => (
  <g>
    {/* Candle body — slightly irregular */}
    <path d="M15,28 L15,16 Q15,15 18,15 Q21,15 21,16 L21,28Z" fill={p.primary} />
    <path d="M16,28 L16,17 Q16,16 18,16 Q20,16 20,17 L20,28Z" fill={p.secondary} opacity="0.4" />
    {/* Wax drips — wabi-sabi imperfection */}
    {tier >= 2 && <path d="M15,20 Q14,22 15,23" stroke={p.secondary} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4" />}
    {tier >= 3 && <path d="M21,18 Q22,20 21,21" stroke={p.secondary} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.35" />}
    {/* Flame — teardrop, warm */}
    <path d="M18,14 Q16,11 18,8 Q20,11 18,14Z" fill={p.accent} opacity="0.7" />
    <path d="M18,13 Q17,11 18,9.5 Q19,11 18,13Z" fill="#fff8e0" opacity="0.5" />
    {/* Warm glow */}
    {tier >= 3 && <circle cx="18" cy="12" r="5" fill={p.accent} opacity="0.1" />}
    <ellipse cx="18" cy="29" rx="4" ry="1" fill="rgba(0,0,0,0.06)" />
  </g>
)

// ═══════════════════════════════════════════════════════════════
// CELESTIAL — rare natural phenomena
// ═══════════════════════════════════════════════════════════════

const drawMoon: DrawFn = (p, tier) => {
  // Tier determines phase: 1=crescent, 2=half, 3=gibbous, 4=full
  const r = 10
  return (
    <g>
      <circle cx="18" cy="17" r={r} fill={p.dark} opacity="0.4" />
      <circle cx="18" cy="17" r={r - 1} fill={p.primary} opacity="0.6" />
      {tier <= 1 && <circle cx="22" cy="17" r={r - 1.5} fill={p.dark} opacity="0.5" />}
      {tier === 2 && <rect x="18" y="7.5" width="10" height="19" fill={p.dark} opacity="0.45" />}
      {tier >= 3 && <circle cx="16" cy="17" r={r - 2} fill={p.secondary} opacity="0.35" />}
      {tier >= 3 && <ellipse cx="15" cy="14" rx="2" ry="1.5" fill={p.accent} opacity="0.2" />}
      {tier >= 4 && <>
        <circle cx="15" cy="15" r="1.5" fill={p.accent} opacity="0.15" />
        <circle cx="20" cy="20" r="1" fill={p.accent} opacity="0.12" />
      </>}
      <ellipse cx="18" cy="29" rx="6" ry="1" fill="rgba(0,0,0,0.04)" />
    </g>
  )
}

const drawConstellation: DrawFn = (p, tier) => {
  const stars = [
    [14, 10], [22, 8], [18, 14], [12, 18], [24, 16], [20, 22], [16, 24],
  ].slice(0, tier >= 3 ? 7 : tier >= 2 ? 5 : 4)
  const lines = [
    [0, 1], [0, 2], [2, 3], [1, 4], [2, 5], [3, 6],
  ].slice(0, tier >= 3 ? 6 : tier >= 2 ? 4 : 3)
  return (
    <g>
      {lines.map(([a, b], i) => (
        <line key={`l${i}`} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]} stroke={p.secondary} strokeWidth="0.4" opacity="0.4" />
      ))}
      {stars.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 0 ? 1.5 : 1} fill={p.accent} opacity="0.7" />
          {tier >= 3 && i < 3 && <circle cx={x} cy={y} r="2.5" fill={p.accent} opacity="0.1" />}
        </g>
      ))}
      <ellipse cx="18" cy="28" rx="8" ry="1" fill="rgba(0,0,0,0.03)" />
    </g>
  )
}

const drawSunrise: DrawFn = (p, tier) => (
  <g>
    {/* Horizon line */}
    <line x1="6" y1="22" x2="30" y2="22" stroke={p.dark} strokeWidth="0.8" opacity="0.3" />
    {/* Sun semicircle — rises with tier */}
    <path d={`M${18 - (tier >= 3 ? 8 : 6)},22 A${tier >= 3 ? 8 : 6},${tier >= 3 ? 8 : 6} 0 0 1 ${18 + (tier >= 3 ? 8 : 6)},22`} fill={p.primary} opacity="0.6" />
    <path d={`M${18 - (tier >= 3 ? 6 : 4)},22 A${tier >= 3 ? 6 : 4},${tier >= 3 ? 6 : 4} 0 0 1 ${18 + (tier >= 3 ? 6 : 4)},22`} fill={p.secondary} opacity="0.5" />
    {/* Rays */}
    {tier >= 2 && <>
      <line x1="18" y1="22" x2="18" y2="10" stroke={p.accent} strokeWidth="0.5" opacity="0.25" strokeLinecap="round" />
      <line x1="18" y1="22" x2="10" y2="14" stroke={p.accent} strokeWidth="0.4" opacity="0.2" strokeLinecap="round" />
      <line x1="18" y1="22" x2="26" y2="14" stroke={p.accent} strokeWidth="0.4" opacity="0.2" strokeLinecap="round" />
    </>}
    {tier >= 3 && <>
      <line x1="18" y1="22" x2="7" y2="18" stroke={p.accent} strokeWidth="0.3" opacity="0.15" strokeLinecap="round" />
      <line x1="18" y1="22" x2="29" y2="18" stroke={p.accent} strokeWidth="0.3" opacity="0.15" strokeLinecap="round" />
    </>}
    {/* Ground reflection */}
    <ellipse cx="18" cy="26" rx="10" ry="3" fill={p.accent} opacity="0.08" />
    <ellipse cx="18" cy="30" rx="10" ry="1" fill="rgba(0,0,0,0.04)" />
  </g>
)

const drawLeaf: DrawFn = (p, tier) => (
  <g>
    {/* Single leaf — mono no aware, beauty in transience */}
    <g transform="rotate(-15 18 18)">
      <path d="M18,6 Q10,14 12,22 Q14,28 18,30 Q22,28 24,22 Q26,14 18,6Z" fill={p.primary} opacity="0.6" />
      <path d="M18,6 Q14,14 16,22 Q17,28 18,30" stroke={p.dark} strokeWidth="0.6" fill="none" opacity="0.4" />
      {/* Veins */}
      <path d="M18,12 Q15,14 14,18" stroke={p.secondary} strokeWidth="0.3" fill="none" opacity="0.3" />
      <path d="M18,16 Q15,18 13,22" stroke={p.secondary} strokeWidth="0.3" fill="none" opacity="0.25" />
      <path d="M18,14 Q21,16 22,20" stroke={p.secondary} strokeWidth="0.3" fill="none" opacity="0.3" />
      {tier >= 2 && <path d="M18,20 Q21,22 23,24" stroke={p.secondary} strokeWidth="0.3" fill="none" opacity="0.2" />}
    </g>
    {/* Second trailing leaf for higher tiers */}
    {tier >= 3 && (
      <g transform="rotate(10 24 26)">
        <path d="M24,18 Q21,22 22,26 Q23,28 24,28 Q25,28 26,26 Q27,22 24,18Z" fill={p.secondary} opacity="0.4" />
        <path d="M24,19 Q23,22 23,26" stroke={p.dark} strokeWidth="0.3" fill="none" opacity="0.25" />
      </g>
    )}
    <ellipse cx="18" cy="31" rx="6" ry="1" fill="rgba(0,0,0,0.04)" />
  </g>
)

// ═══════════════════════════════════════════════════════════════
// ARTISAN — made by patient hands
// ═══════════════════════════════════════════════════════════════

const drawKintsugi: DrawFn = (p, tier) => (
  <g>
    {/* Bowl shape */}
    <path d="M8,18 Q8,26 18,26 Q28,26 28,18" fill={p.dark} />
    <path d="M9,18 Q9,25 18,25 Q27,25 27,18" fill={p.primary} />
    <ellipse cx="18" cy="18" rx="10" ry="3" fill={p.secondary} opacity="0.4" />
    {/* Gold crack lines — the beauty of repair */}
    <path d="M12,18 Q14,22 13,25" stroke="#d4a850" strokeWidth={tier >= 3 ? "1" : "0.7"} fill="none" opacity="0.7" />
    <path d="M22,18 Q20,21 21,24" stroke="#d4a850" strokeWidth={tier >= 3 ? "0.9" : "0.6"} fill="none" opacity="0.65" />
    {tier >= 2 && <path d="M17,18 Q18,22 16,25" stroke="#d4a850" strokeWidth="0.6" fill="none" opacity="0.55" />}
    {tier >= 3 && <>
      <path d="M24,19 Q25,22 24,25" stroke="#d4a850" strokeWidth="0.5" fill="none" opacity="0.5" />
      <path d="M10,20 Q12,21 11,23" stroke="#d4a850" strokeWidth="0.4" fill="none" opacity="0.45" />
    </>}
    <ellipse cx="18" cy="27" rx="9" ry="1.5" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawTeaBowl: DrawFn = (p, tier) => (
  <g>
    {/* Chawan — hand-thrown, deliberately imperfect */}
    <path d="M10,16 Q9,24 12,26 Q18,28 24,26 Q27,24 26,16" fill={p.dark} />
    <path d="M11,16 Q10,23 13,25 Q18,27 23,25 Q26,23 25,16" fill={p.primary} />
    {/* Irregular rim — not a perfect ellipse */}
    <path d="M10,16 Q14,14.5 18,15 Q22,14.5 26,16 Q22,17 18,16.5 Q14,17 10,16Z" fill={p.secondary} opacity="0.5" />
    {/* Interior */}
    <ellipse cx="18" cy="16" rx="7.5" ry="2" fill={p.dark} opacity="0.3" />
    {/* Throwing marks */}
    {tier >= 2 && <>
      <path d="M11,20 Q18,19 25,20" stroke={p.secondary} strokeWidth="0.3" fill="none" opacity="0.25" />
      <path d="M12,22 Q18,21 24,22" stroke={p.secondary} strokeWidth="0.3" fill="none" opacity="0.2" />
    </>}
    {/* Glaze depth */}
    {tier >= 3 && <ellipse cx="16" cy="20" rx="3" ry="2" fill={p.accent} opacity="0.15" />}
    <ellipse cx="18" cy="27" rx="7" ry="1.5" fill="rgba(0,0,0,0.06)" />
  </g>
)

// ── Master list ──────────────────────────────────────────────
const DRAW_FNS: DrawFn[] = [
  drawGeode, drawAmber, drawFossil, drawRiverStone,
  drawLantern, drawCairn, drawSandGarden, drawBonsai,
  drawSingingBowl, drawPrayerBeads, drawIncense, drawCandle,
  drawMoon, drawConstellation, drawSunrise, drawLeaf,
  drawKintsugi, drawTeaBowl,
]

// ── Public API ───────────────────────────────────────────────

export function getTrophyConfig(variant: number, _tier?: number) {
  const baseType = variant % 18
  const paletteIndex = Math.floor(variant / 18) % 4
  void _tier
  return { baseType, paletteIndex, palette: PALETTES[paletteIndex], name: `${PALETTE_NAMES[paletteIndex]} ${ARTIFACT_NAMES[baseType]}` }
}

export function trophyVariantFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 72)
}

export function trophyTier(stepCount: number): number {
  if (stepCount >= 13) return 4
  if (stepCount >= 8) return 3
  if (stepCount >= 4) return 2
  return 1
}

interface Props {
  size?: number
  variant: number  // 0-71
  tier: number     // 1-4
}

export default function TrophySVG({ size = 40, variant, tier }: Props) {
  const { baseType, palette } = getTrophyConfig(variant, tier)
  const drawFn = DRAW_FNS[baseType]
  const scale = tierScale(tier)
  const filterId = `trophy-glow-${variant}-${tier}`

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
      {tier >= 4 && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values={`0 0 0 0 ${parseInt(palette.primary.slice(1, 3), 16) / 255} 0 0 0 0 ${parseInt(palette.primary.slice(3, 5), 16) / 255} 0 0 0 0 ${parseInt(palette.primary.slice(5, 7), 16) / 255} 0 0 0 0.5 0`}
              result="colorBlur" />
            <feMerge>
              <feMergeNode in="colorBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g
        filter={tier >= 4 ? `url(#${filterId})` : undefined}
        transform={`translate(${18 - 18 * scale}, ${18 - 18 * scale}) scale(${scale})`}
      >
        {tier >= 4 && (
          <circle cx="18" cy="18" r="14" fill={palette.glow} opacity="0.15">
            <animate attributeName="opacity" values="0.1;0.25;0.1" dur="4s" repeatCount="indefinite" />
          </circle>
        )}
        {drawFn(palette, tier)}
      </g>
    </svg>
  )
}
