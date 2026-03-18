import { type ReactElement } from 'react'

/* ── colour palettes ── */
const PALETTES = [
  // 0: Gold/Amber
  { primary: '#d4a017', secondary: '#f5d060', dark: '#8b6914', accent: '#fff3c4', glow: 'rgba(212,160,23,0.5)' },
  // 1: Silver/Blue
  { primary: '#8899aa', secondary: '#c0d0e0', dark: '#556677', accent: '#e8f0ff', glow: 'rgba(136,153,170,0.5)' },
  // 2: Bronze/Green
  { primary: '#8b6e4e', secondary: '#b09070', dark: '#5a4030', accent: '#d4e8c0', glow: 'rgba(100,160,80,0.5)' },
  // 3: Ruby/Crimson
  { primary: '#b03040', secondary: '#e06070', dark: '#701828', accent: '#ffd0d8', glow: 'rgba(176,48,64,0.5)' },
]

type Palette = typeof PALETTES[0]

const ARTIFACT_NAMES = [
  'Sword', 'Dagger', 'Axe', 'Bow', 'Spear',           // 0-4   Weapons
  'Helmet', 'Shield', 'Breastplate', 'Gauntlet', 'Crown', // 5-9 Armor
  'Topiary', 'Bonsai', 'Enchanted Flower', 'Crystal Formation', 'Mushroom Cluster', // 10-14 Nature
  'Spell Book', 'Scroll', 'Crystal Ball', 'Wand', 'Potion', // 15-19 Arcane
  'Gold Coins', 'Gem Cluster', 'Chalice', 'Ornate Chest', 'Scepter', // 20-24 Treasure
  'Dragon Egg', 'Phoenix Feather', 'Unicorn Horn', 'Owl Statue', 'Lion Medallion', // 25-29 Creatures
]

const PALETTE_NAMES = ['Golden', 'Silver', 'Bronze', 'Ruby']

/* ── helper: tier-based scale ── */
function tierScale(tier: number): number {
  return [0, 0.7, 0.85, 1.0, 1.1][tier] ?? 1
}

/* ── 30 base artifact drawing functions ── */
type DrawFn = (p: Palette, tier: number) => ReactElement

// Weapons (0-4)
const drawSword: DrawFn = (p, tier) => {
  const d = tier >= 3
  return (
    <g>
      <line x1="18" y1="4" x2="18" y2="26" stroke={p.primary} strokeWidth={tier >= 2 ? 3 : 2} strokeLinecap="round" />
      <line x1="18" y1="4" x2="18" y2="26" stroke={p.secondary} strokeWidth="1" strokeLinecap="round" />
      <rect x="12" y="22" width="12" height={tier >= 2 ? 3 : 2} rx="1" fill={p.dark} />
      {d && <circle cx="12" cy="23" r="1.5" fill={p.accent} />}
      {d && <circle cx="24" cy="23" r="1.5" fill={p.accent} />}
      <rect x="16" y="25" width="4" height="5" rx="1" fill={p.dark} />
      <ellipse cx="18" cy="31" rx="2" ry="1" fill={p.primary} />
      <polygon points="18,4 17,8 19,8" fill={p.secondary} />
    </g>
  )
}

const drawDagger: DrawFn = (p, tier) => (
  <g>
    <polygon points="18,5 20,20 18,22 16,20" fill={p.primary} />
    <line x1="18" y1="6" x2="18" y2="20" stroke={p.secondary} strokeWidth="0.5" />
    <rect x="14" y="20" width="8" height="2" rx="1" fill={p.dark} />
    <rect x="16" y="22" width="4" height="6" rx="1" fill={p.dark} />
    {tier >= 2 && <circle cx="18" cy="21" r="1" fill={p.accent} />}
    {tier >= 3 && <line x1="16" y1="24" x2="20" y2="24" stroke={p.primary} strokeWidth="0.5" />}
    {tier >= 3 && <line x1="16" y1="26" x2="20" y2="26" stroke={p.primary} strokeWidth="0.5" />}
    <ellipse cx="18" cy="32" rx="3" ry="1" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawAxe: DrawFn = (p, tier) => (
  <g>
    <line x1="18" y1="6" x2="18" y2="32" stroke={p.dark} strokeWidth="2.5" strokeLinecap="round" />
    <path d={`M10,8 Q8,14 12,18 L18,14 L18,8 Z`} fill={p.primary} />
    <path d={`M10,8 Q8,14 12,18 L15,16 L15,8 Z`} fill={p.secondary} />
    {tier >= 2 && <circle cx="16" cy="12" r="1" fill={p.accent} />}
    {tier >= 3 && <path d="M26,8 Q28,14 24,18 L18,14 L18,8 Z" fill={p.primary} opacity="0.7" />}
    <ellipse cx="18" cy="33" rx="4" ry="1" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawBow: DrawFn = (p, tier) => (
  <g>
    <path d="M12,6 Q6,18 12,30" stroke={p.primary} strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="12" y1="6" x2="12" y2="30" stroke={p.dark} strokeWidth="0.7" />
    {tier >= 2 && <>
      <line x1="12" y1="18" x2="28" y2="18" stroke={p.dark} strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="28,18 25,16 25,20" fill={p.secondary} />
    </>}
    {tier >= 3 && <circle cx="12" cy="18" r="1.5" fill={p.accent} />}
    {tier >= 3 && <circle cx="12" cy="10" r="1" fill={p.accent} />}
    {tier >= 3 && <circle cx="12" cy="26" r="1" fill={p.accent} />}
    <ellipse cx="18" cy="33" rx="5" ry="1" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawSpear: DrawFn = (p, tier) => (
  <g>
    <line x1="18" y1="10" x2="18" y2="33" stroke={p.dark} strokeWidth="2" strokeLinecap="round" />
    <polygon points="18,3 15,12 18,11 21,12" fill={p.primary} />
    <line x1="18" y1="4" x2="18" y2="11" stroke={p.secondary} strokeWidth="0.5" />
    {tier >= 2 && <path d="M15,12 L14,14 L18,13 L22,14 L21,12" fill={p.dark} opacity="0.6" />}
    {tier >= 3 && <>
      <line x1="16" y1="16" x2="20" y2="16" stroke={p.primary} strokeWidth="0.7" />
      <line x1="16" y1="18" x2="20" y2="18" stroke={p.primary} strokeWidth="0.7" />
    </>}
    <ellipse cx="18" cy="33" rx="2" ry="0.8" fill="rgba(0,0,0,0.08)" />
  </g>
)

// Armor (5-9)
const drawHelmet: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="22" rx="10" ry="8" fill={p.primary} />
    <ellipse cx="18" cy="20" rx="9" ry="7" fill={p.secondary} />
    <rect x="14" y="24" width="8" height="4" rx="1" fill={p.dark} />
    <path d="M14,26 L22,26" stroke={p.primary} strokeWidth="0.5" />
    {tier >= 2 && <path d="M18,10 L18,14" stroke={p.accent} strokeWidth="2" strokeLinecap="round" />}
    {tier >= 3 && <>
      <circle cx="14" cy="20" r="1" fill={p.accent} />
      <circle cx="22" cy="20" r="1" fill={p.accent} />
      <path d="M12,16 Q18,12 24,16" stroke={p.accent} strokeWidth="0.5" fill="none" />
    </>}
    <ellipse cx="18" cy="30" rx="8" ry="1.5" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawShield: DrawFn = (p, tier) => (
  <g>
    <path d="M18,4 L28,10 L28,20 Q28,30 18,34 Q8,30 8,20 L8,10 Z" fill={p.primary} />
    <path d="M18,6 L26,11 L26,20 Q26,28 18,32 Q10,28 10,20 L10,11 Z" fill={p.secondary} />
    <line x1="18" y1="6" x2="18" y2="32" stroke={p.dark} strokeWidth="0.5" />
    <line x1="10" y1="18" x2="26" y2="18" stroke={p.dark} strokeWidth="0.5" />
    {tier >= 2 && <circle cx="18" cy="18" r="3" fill={p.primary} stroke={p.dark} strokeWidth="0.5" />}
    {tier >= 3 && <>
      <circle cx="18" cy="18" r="1.5" fill={p.accent} />
      <circle cx="18" cy="10" r="1" fill={p.accent} />
      <circle cx="18" cy="26" r="1" fill={p.accent} />
    </>}
  </g>
)

const drawBreastplate: DrawFn = (p, tier) => (
  <g>
    <path d="M10,10 L14,8 L22,8 L26,10 L28,20 L24,30 L12,30 L8,20 Z" fill={p.primary} />
    <path d="M12,10 L14,9 L22,9 L24,10 L26,19 L23,28 L13,28 L10,19 Z" fill={p.secondary} />
    <line x1="18" y1="9" x2="18" y2="28" stroke={p.dark} strokeWidth="0.5" />
    {tier >= 2 && <path d="M14,14 L22,14 L21,18 L15,18 Z" fill={p.primary} opacity="0.5" />}
    {tier >= 3 && <>
      <circle cx="18" cy="16" r="2" fill={p.accent} opacity="0.5" />
      <path d="M14,22 L22,22" stroke={p.dark} strokeWidth="0.5" />
      <path d="M15,25 L21,25" stroke={p.dark} strokeWidth="0.5" />
    </>}
    <ellipse cx="18" cy="32" rx="7" ry="1" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawGauntlet: DrawFn = (p, tier) => (
  <g>
    <rect x="12" y="14" width="12" height="14" rx="3" fill={p.primary} />
    <rect x="13" y="15" width="10" height="12" rx="2" fill={p.secondary} />
    {/* fingers */}
    <rect x="12" y="8" width="3" height="7" rx="1.5" fill={p.primary} />
    <rect x="16" y="6" width="3" height="9" rx="1.5" fill={p.primary} />
    <rect x="20" y="8" width="3" height="7" rx="1.5" fill={p.primary} />
    {tier >= 2 && <>
      <line x1="13" y1="18" x2="23" y2="18" stroke={p.dark} strokeWidth="0.5" />
      <line x1="13" y1="21" x2="23" y2="21" stroke={p.dark} strokeWidth="0.5" />
    </>}
    {tier >= 3 && <circle cx="18" cy="24" r="2" fill={p.accent} opacity="0.5" />}
    <ellipse cx="18" cy="30" rx="6" ry="1" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawCrown: DrawFn = (p, tier) => (
  <g>
    <path d="M8,20 L10,10 L14,16 L18,8 L22,16 L26,10 L28,20 Z" fill={p.primary} />
    <path d="M8,20 L28,20 L27,26 L9,26 Z" fill={p.dark} />
    <path d="M9,20 L27,20 L26.5,24 L9.5,24 Z" fill={p.secondary} />
    {tier >= 2 && <>
      <circle cx="18" cy="9" r="1.5" fill={p.accent} />
      <circle cx="10" cy="11" r="1" fill={p.accent} />
      <circle cx="26" cy="11" r="1" fill={p.accent} />
    </>}
    {tier >= 3 && <>
      <circle cx="14" cy="22" r="1" fill={p.accent} />
      <circle cx="18" cy="22" r="1" fill={p.accent} />
      <circle cx="22" cy="22" r="1" fill={p.accent} />
    </>}
    <ellipse cx="18" cy="28" rx="10" ry="1.5" fill="rgba(0,0,0,0.08)" />
  </g>
)

// Nature (10-14)
const drawTopiary: DrawFn = (p, tier) => (
  <g>
    <rect x="17" y="22" width="2" height="10" rx="0.5" fill="#6b4e3d" />
    <circle cx="18" cy="16" r={tier >= 3 ? 10 : tier >= 2 ? 8 : 6} fill={p.primary} />
    <circle cx="18" cy="16" r={tier >= 3 ? 8 : tier >= 2 ? 6 : 4} fill={p.secondary} />
    {tier >= 2 && <circle cx="15" cy="14" r="2" fill={p.accent} opacity="0.3" />}
    {tier >= 3 && <>
      <circle cx="21" cy="13" r="1.5" fill={p.accent} opacity="0.4" />
      <circle cx="17" cy="19" r="1" fill={p.accent} opacity="0.3" />
    </>}
    <ellipse cx="18" cy="33" rx="4" ry="1" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawBonsai: DrawFn = (p, tier) => (
  <g>
    <rect x="12" y="28" width="12" height="4" rx="1" fill="#8a7e6e" />
    <path d="M18,28 Q14,24 12,18 Q10,12 16,10" stroke="#6b4e3d" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M18,28 Q22,22 24,16" stroke="#6b4e3d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="14" cy="12" r={tier >= 2 ? 5 : 4} fill={p.primary} />
    <circle cx="22" cy="14" r={tier >= 2 ? 4 : 3} fill={p.secondary} />
    {tier >= 3 && <circle cx="18" cy="10" r="3" fill={p.primary} opacity="0.7" />}
    {tier >= 3 && <circle cx="13" cy="11" r="1" fill={p.accent} opacity="0.4" />}
    <ellipse cx="18" cy="33" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawEnchantedFlower: DrawFn = (p, tier) => (
  <g>
    <line x1="18" y1="18" x2="18" y2="33" stroke="#5a8040" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18,28 Q14,24 12,26" stroke="#5a8040" strokeWidth="1" fill="none" />
    {/* petals */}
    <ellipse cx="18" cy="12" rx="3" ry="5" fill={p.primary} />
    <ellipse cx="12" cy="16" rx="5" ry="3" fill={p.primary} transform="rotate(-30 12 16)" />
    <ellipse cx="24" cy="16" rx="5" ry="3" fill={p.primary} transform="rotate(30 24 16)" />
    <ellipse cx="14" cy="20" rx="4" ry="3" fill={p.secondary} transform="rotate(20 14 20)" />
    <ellipse cx="22" cy="20" rx="4" ry="3" fill={p.secondary} transform="rotate(-20 22 20)" />
    <circle cx="18" cy="16" r={tier >= 2 ? 3 : 2} fill={p.accent} />
    {tier >= 3 && <>
      <circle cx="18" cy="16" r="1.5" fill={p.primary} />
      <circle cx="16" cy="10" r="0.8" fill={p.accent} opacity="0.6" />
      <circle cx="20" cy="10" r="0.8" fill={p.accent} opacity="0.6" />
    </>}
  </g>
)

const drawCrystalFormation: DrawFn = (p, tier) => (
  <g>
    <polygon points="18,4 21,20 15,20" fill={p.primary} />
    <polygon points="18,4 18,20 15,20" fill={p.secondary} />
    <polygon points="12,10 15,22 9,22" fill={p.primary} opacity="0.8" />
    <polygon points="24,12 27,24 21,24" fill={p.secondary} opacity="0.8" />
    {tier >= 2 && <polygon points="22,8 24,18 20,18" fill={p.primary} opacity="0.6" />}
    {tier >= 3 && <>
      <polygon points="10,14 12,22 8,22" fill={p.accent} opacity="0.4" />
      <line x1="18" y1="5" x2="18" y2="18" stroke={p.accent} strokeWidth="0.5" opacity="0.5" />
    </>}
    <ellipse cx="18" cy="24" rx="9" ry="2" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawMushroomCluster: DrawFn = (p, tier) => (
  <g>
    <rect x="17" y="20" width="2" height="10" rx="1" fill="#e0d8c8" />
    <ellipse cx="18" cy="20" rx="7" ry="5" fill={p.primary} />
    <ellipse cx="16" cy="18" rx="2" ry="1" fill={p.accent} opacity="0.5" />
    <ellipse cx="21" cy="19" rx="1.5" ry="1" fill={p.accent} opacity="0.4" />
    {tier >= 2 && <>
      <rect x="10" y="24" width="1.5" height="6" rx="0.5" fill="#e0d8c8" />
      <ellipse cx="11" cy="24" rx="4" ry="3" fill={p.secondary} />
    </>}
    {tier >= 3 && <>
      <rect x="24" y="22" width="1.5" height="7" rx="0.5" fill="#e0d8c8" />
      <ellipse cx="25" cy="22" rx="3.5" ry="2.5" fill={p.primary} opacity="0.8" />
      <ellipse cx="10" cy="23" rx="1" ry="0.6" fill={p.accent} opacity="0.4" />
    </>}
    <ellipse cx="18" cy="32" rx="8" ry="1.5" fill="rgba(0,0,0,0.06)" />
  </g>
)

// Arcane (15-19)
const drawSpellBook: DrawFn = (p, tier) => (
  <g>
    <rect x="8" y="10" width="20" height="22" rx="2" fill={p.dark} />
    <rect x="9" y="11" width="18" height="20" rx="1.5" fill={p.primary} />
    <rect x="11" y="13" width="14" height="16" rx="1" fill={p.accent} opacity="0.3" />
    <line x1="18" y1="11" x2="18" y2="31" stroke={p.dark} strokeWidth="0.5" />
    {tier >= 2 && <>
      <circle cx="18" cy="21" r="3" fill={p.dark} opacity="0.3" />
      <path d="M16,19 L20,19 M18,17 L18,23" stroke={p.secondary} strokeWidth="0.7" />
    </>}
    {tier >= 3 && <>
      <circle cx="18" cy="21" r="1" fill={p.accent} />
      <path d="M12,15 L24,15" stroke={p.dark} strokeWidth="0.3" />
      <path d="M12,27" stroke={p.dark} strokeWidth="0.3" />
    </>}
    <rect x="8" y="10" width="20" height="2" rx="1" fill={p.dark} />
    <rect x="8" y="30" width="20" height="2" rx="1" fill={p.dark} />
  </g>
)

const drawScroll: DrawFn = (p, tier) => (
  <g>
    <rect x="12" y="8" width="12" height="22" rx="1" fill={p.accent} opacity="0.6" />
    {/* rolled top */}
    <ellipse cx="18" cy="8" rx="7" ry="2.5" fill={p.primary} />
    <ellipse cx="18" cy="8" rx="5" ry="1.5" fill={p.secondary} />
    {/* rolled bottom */}
    <ellipse cx="18" cy="30" rx="7" ry="2.5" fill={p.primary} />
    <ellipse cx="18" cy="30" rx="5" ry="1.5" fill={p.secondary} />
    {/* text lines */}
    {tier >= 2 && <>
      <line x1="14" y1="14" x2="22" y2="14" stroke={p.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="14" y1="17" x2="22" y2="17" stroke={p.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="14" y1="20" x2="20" y2="20" stroke={p.dark} strokeWidth="0.5" opacity="0.3" />
    </>}
    {tier >= 3 && <circle cx="18" cy="24" r="2" fill={p.primary} opacity="0.3" />}
  </g>
)

const drawCrystalBall: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="6" ry="2" fill={p.dark} />
    <rect x="14" y="28" width="8" height="3" rx="1" fill={p.dark} />
    <circle cx="18" cy="18" r={tier >= 3 ? 12 : tier >= 2 ? 10 : 8} fill={p.primary} opacity="0.5" />
    <circle cx="18" cy="18" r={tier >= 3 ? 10 : tier >= 2 ? 8 : 6} fill={p.secondary} opacity="0.4" />
    <ellipse cx="15" cy="14" rx="3" ry="2" fill={p.accent} opacity="0.4" />
    {tier >= 3 && <>
      <circle cx="20" cy="20" r="2" fill={p.accent} opacity="0.2" />
      <path d="M14,22 Q18,18 22,22" stroke={p.accent} strokeWidth="0.5" fill="none" opacity="0.3" />
    </>}
  </g>
)

const drawWand: DrawFn = (p, tier) => (
  <g>
    <line x1="12" y1="32" x2="24" y2="6" stroke={p.dark} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="32" x2="24" y2="6" stroke={p.primary} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="24" cy="6" r={tier >= 2 ? 3 : 2} fill={p.secondary} />
    <circle cx="24" cy="6" r={tier >= 2 ? 1.5 : 1} fill={p.accent} />
    {tier >= 2 && <>
      <circle cx="27" cy="4" r="1" fill={p.accent} opacity="0.5" />
      <circle cx="22" cy="3" r="0.8" fill={p.accent} opacity="0.4" />
    </>}
    {tier >= 3 && <>
      <circle cx="26" cy="8" r="0.8" fill={p.accent} opacity="0.5" />
      <circle cx="28" cy="6" r="0.6" fill={p.accent} opacity="0.3" />
    </>}
  </g>
)

const drawPotion: DrawFn = (p, tier) => (
  <g>
    <rect x="15" y="6" width="6" height="5" rx="1" fill={p.dark} />
    <rect x="16" y="4" width="4" height="3" rx="0.5" fill={p.primary} />
    <path d="M13,14 L15,11 L21,11 L23,14 L24,26 Q24,30 18,30 Q12,30 12,26 Z" fill={p.primary} opacity="0.6" />
    <path d="M13,14 L15,11 L21,11 L23,14 L24,26 Q24,30 18,30 Q12,30 12,26 Z" fill={p.secondary} opacity="0.4" />
    <ellipse cx="18" cy="24" rx="5" ry="3" fill={p.accent} opacity="0.3" />
    {tier >= 2 && <>
      <circle cx="16" cy="22" r="1" fill={p.accent} opacity="0.5" />
      <circle cx="20" cy="20" r="0.8" fill={p.accent} opacity="0.4" />
    </>}
    {tier >= 3 && <circle cx="18" cy="18" r="1.5" fill={p.accent} opacity="0.6" />}
    <ellipse cx="18" cy="31" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
  </g>
)

// Treasure (20-24)
const drawGoldCoins: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="28" rx="8" ry="3" fill={p.dark} />
    <ellipse cx="18" cy="27" rx="8" ry="3" fill={p.primary} />
    <ellipse cx="18" cy="27" rx="6" ry="2" fill={p.secondary} />
    {tier >= 2 && <>
      <ellipse cx="14" cy="24" rx="6" ry="2.5" fill={p.dark} />
      <ellipse cx="14" cy="23" rx="6" ry="2.5" fill={p.primary} />
      <ellipse cx="14" cy="23" rx="4" ry="1.5" fill={p.secondary} />
    </>}
    {tier >= 3 && <>
      <ellipse cx="22" cy="22" rx="5" ry="2" fill={p.dark} />
      <ellipse cx="22" cy="21" rx="5" ry="2" fill={p.primary} />
      <ellipse cx="22" cy="21" rx="3" ry="1" fill={p.secondary} />
      <circle cx="18" cy="27" r="1" fill={p.accent} opacity="0.5" />
    </>}
  </g>
)

const drawGemCluster: DrawFn = (p, tier) => (
  <g>
    <polygon points="18,6 22,16 18,14 14,16" fill={p.primary} />
    <polygon points="18,6 18,14 14,16" fill={p.secondary} />
    <polygon points="12,12 16,22 8,22" fill={p.primary} opacity="0.8" />
    <polygon points="24,10 28,20 20,20" fill={p.secondary} opacity="0.8" />
    {tier >= 2 && <>
      <polygon points="20,16 24,26 16,26" fill={p.primary} opacity="0.7" />
      <line x1="18" y1="7" x2="18" y2="13" stroke={p.accent} strokeWidth="0.5" opacity="0.5" />
    </>}
    {tier >= 3 && <>
      <polygon points="10,18 14,28 6,28" fill={p.accent} opacity="0.4" />
      <line x1="12" y1="13" x2="12" y2="20" stroke={p.accent} strokeWidth="0.4" opacity="0.5" />
      <line x1="24" y1="11" x2="24" y2="18" stroke={p.accent} strokeWidth="0.4" opacity="0.5" />
    </>}
    <ellipse cx="18" cy="28" rx="10" ry="2" fill="rgba(0,0,0,0.06)" />
  </g>
)

const drawChalice: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="32" rx="6" ry="2" fill={p.dark} />
    <ellipse cx="18" cy="31" rx="6" ry="1.5" fill={p.primary} />
    <rect x="16" y="20" width="4" height="11" rx="1" fill={p.dark} />
    <path d="M8,10 Q8,20 18,20 Q28,20 28,10 Z" fill={p.primary} />
    <path d="M10,10 Q10,18 18,18 Q26,18 26,10 Z" fill={p.secondary} opacity="0.5" />
    <ellipse cx="18" cy="10" rx="10" ry="3" fill={p.primary} />
    <ellipse cx="18" cy="10" rx="8" ry="2" fill={p.secondary} />
    {tier >= 2 && <ellipse cx="16" cy="9" rx="3" ry="1" fill={p.accent} opacity="0.3" />}
    {tier >= 3 && <>
      <circle cx="18" cy="24" r="1.5" fill={p.accent} opacity="0.5" />
      <circle cx="12" cy="14" r="0.8" fill={p.accent} opacity="0.4" />
    </>}
  </g>
)

const drawOrnateChest: DrawFn = (p, tier) => (
  <g>
    <rect x="6" y="18" width="24" height="12" rx="2" fill={p.dark} />
    <rect x="7" y="19" width="22" height="10" rx="1.5" fill={p.primary} />
    <path d="M6,18 Q18,12 30,18" fill={p.secondary} />
    <path d="M8,18 Q18,14 28,18" fill={p.primary} />
    <rect x="16" y="22" width="4" height="3" rx="0.5" fill={p.dark} />
    <circle cx="18" cy="23.5" r="1" fill={p.accent} />
    {tier >= 2 && <>
      <line x1="8" y1="24" x2="14" y2="24" stroke={p.dark} strokeWidth="0.5" />
      <line x1="22" y1="24" x2="28" y2="24" stroke={p.dark} strokeWidth="0.5" />
    </>}
    {tier >= 3 && <>
      <circle cx="10" cy="16" r="1" fill={p.accent} opacity="0.6" />
      <circle cx="26" cy="16" r="1" fill={p.accent} opacity="0.6" />
      <circle cx="18" cy="14" r="1.5" fill={p.accent} opacity="0.5" />
    </>}
    <ellipse cx="18" cy="31" rx="12" ry="1.5" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawScepter: DrawFn = (p, tier) => (
  <g>
    <line x1="18" y1="10" x2="18" y2="33" stroke={p.dark} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="18" y1="10" x2="18" y2="33" stroke={p.primary} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="18" cy="8" r={tier >= 2 ? 5 : 3.5} fill={p.primary} />
    <circle cx="18" cy="8" r={tier >= 2 ? 3 : 2} fill={p.secondary} />
    <circle cx="18" cy="8" r={tier >= 2 ? 1.5 : 1} fill={p.accent} />
    {tier >= 2 && <>
      <circle cx="18" cy="30" r="2" fill={p.primary} />
      <line x1="16" y1="16" x2="20" y2="16" stroke={p.secondary} strokeWidth="1" />
    </>}
    {tier >= 3 && <>
      <circle cx="14" cy="8" r="1.5" fill={p.accent} opacity="0.4" />
      <circle cx="22" cy="8" r="1.5" fill={p.accent} opacity="0.4" />
      <line x1="16" y1="20" x2="20" y2="20" stroke={p.secondary} strokeWidth="1" />
    </>}
  </g>
)

// Creatures (25-29)
const drawDragonEgg: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="20" rx={tier >= 3 ? 10 : tier >= 2 ? 9 : 7} ry={tier >= 3 ? 13 : tier >= 2 ? 11 : 9} fill={p.primary} />
    <ellipse cx="18" cy="18" rx={tier >= 3 ? 8 : tier >= 2 ? 7 : 5} ry={tier >= 3 ? 11 : tier >= 2 ? 9 : 7} fill={p.secondary} opacity="0.5" />
    <ellipse cx="15" cy="15" rx="3" ry="4" fill={p.accent} opacity="0.2" />
    {/* Scale pattern */}
    {tier >= 2 && <>
      <path d="M14,16 Q18,14 22,16" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M13,20 Q18,18 23,20" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M14,24 Q18,22 22,24" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
    </>}
    {tier >= 3 && <ellipse cx="20" cy="12" rx="2" ry="1" fill={p.accent} opacity="0.3" />}
    <ellipse cx="18" cy="33" rx="7" ry="1.5" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawPhoenixFeather: DrawFn = (p, tier) => (
  <g>
    <path d={`M18,4 Q12,12 10,20 Q8,28 14,32 L18,28 Q14,20 18,4`} fill={p.primary} />
    <path d={`M18,4 Q22,12 20,20 Q22,28 18,28 L18,4`} fill={p.secondary} />
    <line x1="18" y1="4" x2="16" y2="30" stroke={p.dark} strokeWidth="0.7" />
    {tier >= 2 && <>
      <path d="M14,14 Q16,12 18,14" stroke={p.accent} strokeWidth="0.5" fill="none" />
      <path d="M12,20 Q15,18 18,20" stroke={p.accent} strokeWidth="0.5" fill="none" />
    </>}
    {tier >= 3 && <>
      <path d="M20,10 Q18,12 18,14" stroke={p.accent} strokeWidth="0.5" fill="none" />
      <circle cx="18" cy="6" r="1" fill={p.accent} opacity="0.6" />
    </>}
  </g>
)

const drawUnicornHorn: DrawFn = (p, tier) => (
  <g>
    <polygon points="18,2 22,30 14,30" fill={p.primary} />
    <polygon points="18,2 18,30 14,30" fill={p.secondary} />
    {/* spiral */}
    <path d="M16,8 Q20,10 16,14 Q20,16 16,20 Q20,22 16,26" stroke={p.dark} strokeWidth="0.5" fill="none" />
    {tier >= 2 && <>
      <circle cx="18" cy="4" r="1.5" fill={p.accent} opacity="0.5" />
      <line x1="14" y1="28" x2="22" y2="28" stroke={p.dark} strokeWidth="0.5" />
    </>}
    {tier >= 3 && <>
      <circle cx="18" cy="3" r="2" fill={p.accent} opacity="0.4" />
      <circle cx="16" cy="12" r="0.8" fill={p.accent} opacity="0.3" />
      <circle cx="16" cy="20" r="0.8" fill={p.accent} opacity="0.3" />
    </>}
    <ellipse cx="18" cy="31" rx="4" ry="1" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawOwlStatue: DrawFn = (p, tier) => (
  <g>
    {/* body */}
    <ellipse cx="18" cy="22" rx={tier >= 2 ? 8 : 6} ry={tier >= 2 ? 10 : 8} fill={p.primary} />
    <ellipse cx="18" cy="20" rx={tier >= 2 ? 6 : 5} ry={tier >= 2 ? 8 : 6} fill={p.secondary} opacity="0.5" />
    {/* eyes */}
    <circle cx="14" cy="16" r="3" fill={p.dark} />
    <circle cx="22" cy="16" r="3" fill={p.dark} />
    <circle cx="14" cy="16" r="1.5" fill={p.accent} />
    <circle cx="22" cy="16" r="1.5" fill={p.accent} />
    {/* beak */}
    <polygon points="18,18 16,20 20,20" fill={p.dark} />
    {/* ears */}
    {tier >= 2 && <>
      <polygon points="12,10 10,6 14,12" fill={p.primary} />
      <polygon points="24,10 26,6 22,12" fill={p.primary} />
    </>}
    {tier >= 3 && <>
      <path d="M12,24 Q10,28 8,26" stroke={p.dark} strokeWidth="1" fill="none" />
      <path d="M24,24 Q26,28 28,26" stroke={p.dark} strokeWidth="1" fill="none" />
    </>}
    <ellipse cx="18" cy="32" rx="6" ry="1.5" fill="rgba(0,0,0,0.08)" />
  </g>
)

const drawLionMedallion: DrawFn = (p, tier) => (
  <g>
    <circle cx="18" cy="18" r={tier >= 3 ? 13 : tier >= 2 ? 11 : 9} fill={p.dark} />
    <circle cx="18" cy="18" r={tier >= 3 ? 11 : tier >= 2 ? 9 : 7} fill={p.primary} />
    <circle cx="18" cy="18" r={tier >= 3 ? 9 : tier >= 2 ? 7 : 5} fill={p.secondary} />
    {/* simplified lion face */}
    <circle cx="15" cy="16" r="1" fill={p.dark} />
    <circle cx="21" cy="16" r="1" fill={p.dark} />
    <path d="M16,20 Q18,22 20,20" stroke={p.dark} strokeWidth="0.7" fill="none" />
    <polygon points="18,18 17,20 19,20" fill={p.dark} />
    {tier >= 2 && <path d="M12,12 Q18,8 24,12" stroke={p.dark} strokeWidth="0.7" fill="none" />}
    {tier >= 3 && <>
      <circle cx="18" cy="18" r="12" stroke={p.accent} strokeWidth="0.5" fill="none" opacity="0.5" />
      <circle cx="12" cy="10" r="1" fill={p.accent} opacity="0.3" />
      <circle cx="24" cy="10" r="1" fill={p.accent} opacity="0.3" />
    </>}
  </g>
)

/* ── master list of 30 draw functions ── */
const DRAW_FNS: DrawFn[] = [
  drawSword, drawDagger, drawAxe, drawBow, drawSpear,
  drawHelmet, drawShield, drawBreastplate, drawGauntlet, drawCrown,
  drawTopiary, drawBonsai, drawEnchantedFlower, drawCrystalFormation, drawMushroomCluster,
  drawSpellBook, drawScroll, drawCrystalBall, drawWand, drawPotion,
  drawGoldCoins, drawGemCluster, drawChalice, drawOrnateChest, drawScepter,
  drawDragonEgg, drawPhoenixFeather, drawUnicornHorn, drawOwlStatue, drawLionMedallion,
]

/* ── public API ── */

export function getTrophyConfig(variant: number, _tier?: number) {
  const baseType = variant % 30
  const paletteIndex = Math.floor(variant / 30) % 4
  void _tier // tier used only for rendering, not config lookup
  return { baseType, paletteIndex, palette: PALETTES[paletteIndex], name: `${PALETTE_NAMES[paletteIndex]} ${ARTIFACT_NAMES[baseType]}` }
}

export function trophyVariantFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 120)
}

export function trophyTier(stepCount: number): number {
  if (stepCount >= 11) return 4
  if (stepCount >= 7) return 3
  if (stepCount >= 4) return 2
  return 1
}

interface Props {
  size?: number
  variant: number  // 0-119
  tier: number     // 1-4
}

/** Procedural trophy for completed hydra tasks — 120 unique variants across 4 tiers */
export default function TrophySVG({ size = 36, variant, tier }: Props) {
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
    >
      {tier >= 4 && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values={`0 0 0 0 ${parseInt(palette.primary.slice(1, 3), 16) / 255} 0 0 0 0 ${parseInt(palette.primary.slice(3, 5), 16) / 255} 0 0 0 0 ${parseInt(palette.primary.slice(5, 7), 16) / 255} 0 0 0 0.6 0`}
              result="colorBlur" />
            <feMerge>
              <feMergeNode in="colorBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g
        transform={`translate(${18 - 18 * scale}, ${36 - 36 * scale}) scale(${scale})`}
        filter={tier >= 4 ? `url(#${filterId})` : undefined}
      >
        {drawFn(palette, tier)}
      </g>
      {tier >= 4 && (
        <circle cx="18" cy="18" r="16" fill="none" stroke={palette.glow} strokeWidth="0.5" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}
