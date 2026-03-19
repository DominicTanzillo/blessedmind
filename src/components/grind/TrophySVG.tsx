import { type ReactElement } from 'react'

// ── Material palettes: Terracotta → Moss → Copper → Jade ──────
const PALETTES = [
  // Terracotta — warm, earthy, matte
  { primary: '#b07850', secondary: '#d4a882', dark: '#7a5235', accent: '#f0dcc8', glow: 'rgba(176,120,80,0.4)' },
  // Moss Stone — cool, natural, solid
  { primary: '#7a8878', secondary: '#a5b5a0', dark: '#4a5a48', accent: '#d0ddd0', glow: 'rgba(122,136,120,0.4)' },
  // Copper — warm metallic with green patina
  { primary: '#8a6e50', secondary: '#6db89a', dark: '#5a4030', accent: '#c8e8d8', glow: 'rgba(109,184,154,0.4)' },
  // Jade — deep, luminous, precious
  { primary: '#3a7a5a', secondary: '#68b898', dark: '#1a4a32', accent: '#e0f5ea', glow: 'rgba(58,122,90,0.5)' },
]

type Palette = typeof PALETTES[0]

const ORNAMENT_NAMES = [
  // Statuary (0-4)
  'Bird Bath', 'Garden Gnome', 'Stone Frog', 'Bunny Figure', 'Cat Figurine',
  // Structures (5-9)
  'Stone Lantern', 'Tiered Fountain', 'Wishing Well', 'Birdhouse', 'Mini Pagoda',
  // Garden Instruments (10-14)
  'Sundial', 'Gazing Ball', 'Wind Chimes', 'Armillary Sphere', 'Garden Bell',
  // Planters & Flora (15-19)
  'Flower Pot', 'Herb Planter', 'Fairy Mushrooms', 'Watering Can', 'Mini Bonsai',
  // Whimsical (20-24)
  'Fairy Door', 'Garden Sign', 'Toadstool Seat', 'Stone Owl', 'Turtle Statue',
  // Artisan (25-29)
  'Cairn Stack', 'Stepping Stones', 'Garden Obelisk', 'Bee Skep', 'Kintsugi Bowl',
]

const PALETTE_NAMES = ['Terracotta', 'Moss', 'Copper', 'Jade']

function tierScale(tier: number): number {
  return [0, 0.78, 0.88, 1.0, 1.06][tier] ?? 1
}

type DrawFn = (p: Palette, tier: number) => ReactElement

// ═══════════════════════════════════════════════════════════════
// STATUARY (0-4)
// ═══════════════════════════════════════════════════════════════

// 0. Bird Bath — wide shallow basin on narrow pedestal
const drawBirdBath: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="7" ry="1.5" fill="rgba(0,0,0,0.06)" />
    {/* Pedestal */}
    <rect x="15" y="22" width="6" height="8" rx="1" fill={p.dark} />
    <rect x="15.5" y="22.5" width="5" height="7" rx="0.8" fill={p.primary} />
    {/* Base plate */}
    <rect x="12" y="28" width="12" height="2" rx="1" fill={p.dark} />
    {/* Basin */}
    <path d="M8,18 Q8,22 18,22 Q28,22 28,18" fill={p.dark} />
    <path d="M9,18 Q9,21 18,21 Q27,21 27,18" fill={p.primary} />
    <ellipse cx="18" cy="18" rx="10" ry="3" fill={p.secondary} opacity="0.5" />
    {/* Water in basin */}
    {tier >= 2 && <ellipse cx="18" cy="18.5" rx="7" ry="1.8" fill={p.accent} opacity="0.4" />}
    {/* Small bird on rim */}
    {tier >= 3 && (
      <g>
        <ellipse cx="24" cy="16" rx="2" ry="1.5" fill={p.dark} />
        <circle cx="25.5" cy="15" r="1.2" fill={p.dark} />
        <polygon points="26.7,15 28,14.8 26.7,15.3" fill={p.secondary} />
      </g>
    )}
  </g>
)

// 1. Garden Gnome — pointy hat, round body
const drawGnome: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Body — round */}
    <ellipse cx="18" cy="25" rx="6" ry="5" fill={p.dark} />
    <ellipse cx="18" cy="24.5" rx="5.5" ry="4.5" fill={p.primary} />
    {/* Pointy hat — tall cone */}
    <path d="M12,18 L18,5 L24,18Z" fill={p.dark} />
    <path d="M13,18 L18,6 L23,18Z" fill={p.secondary} />
    {/* Face area */}
    <circle cx="18" cy="18" r="3.5" fill={p.accent} opacity="0.5" />
    {/* Beard */}
    {tier >= 2 && <path d="M15,19 Q18,24 21,19" fill={p.accent} opacity="0.4" />}
    {/* Eyes */}
    {tier >= 3 && (
      <>
        <circle cx="16.5" cy="17" r="0.6" fill={p.dark} />
        <circle cx="19.5" cy="17" r="0.6" fill={p.dark} />
      </>
    )}
  </g>
)

// 2. Stone Frog — rounded squat body with eye bumps
const drawFrog: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="7" ry="1.2" fill="rgba(0,0,0,0.06)" />
    {/* Body — wide and squat */}
    <ellipse cx="18" cy="25" rx="8" ry="5" fill={p.dark} />
    <ellipse cx="18" cy="24.5" rx="7.5" ry="4.5" fill={p.primary} />
    {/* Eye bumps */}
    <circle cx="13" cy="20" r="2.5" fill={p.dark} />
    <circle cx="13" cy="19.5" r="2.2" fill={p.primary} />
    <circle cx="13" cy="19" r="1" fill={p.accent} opacity="0.5" />
    <circle cx="23" cy="20" r="2.5" fill={p.dark} />
    <circle cx="23" cy="19.5" r="2.2" fill={p.primary} />
    <circle cx="23" cy="19" r="1" fill={p.accent} opacity="0.5" />
    {/* Smile line */}
    {tier >= 2 && <path d="M14,24 Q18,27 22,24" stroke={p.dark} strokeWidth="0.8" fill="none" />}
    {/* Front feet */}
    {tier >= 3 && (
      <>
        <ellipse cx="11" cy="28" rx="2" ry="1" fill={p.dark} opacity="0.6" />
        <ellipse cx="25" cy="28" rx="2" ry="1" fill={p.dark} opacity="0.6" />
      </>
    )}
  </g>
)

// 3. Bunny Figure — oval body, tall ears, sitting
const drawBunny: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="5" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Body — oval, sitting */}
    <ellipse cx="18" cy="25" rx="5.5" ry="5" fill={p.dark} />
    <ellipse cx="18" cy="24.5" rx="5" ry="4.5" fill={p.primary} />
    {/* Head */}
    <circle cx="18" cy="17" r="4" fill={p.dark} />
    <circle cx="18" cy="16.8" r="3.6" fill={p.primary} />
    {/* Tall ears */}
    <ellipse cx="15" cy="10" rx="1.8" ry="5" fill={p.dark} />
    <ellipse cx="15" cy="10" rx="1.3" ry="4.2" fill={p.secondary} opacity="0.5" />
    <ellipse cx="21" cy="10" rx="1.8" ry="5" fill={p.dark} />
    <ellipse cx="21" cy="10" rx="1.3" ry="4.2" fill={p.secondary} opacity="0.5" />
    {/* Cotton tail */}
    {tier >= 2 && <circle cx="23" cy="26" r="1.5" fill={p.accent} opacity="0.6" />}
    {/* Nose */}
    {tier >= 3 && (
      <>
        <ellipse cx="18" cy="18" rx="1" ry="0.7" fill={p.accent} opacity="0.6" />
        <circle cx="18" cy="17.5" r="0.5" fill={p.dark} opacity="0.5" />
      </>
    )}
  </g>
)

// 4. Cat Figurine — sitting cat with pointed ears and curved tail
const drawCat: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="5" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Body — sitting upright */}
    <ellipse cx="18" cy="25" rx="5" ry="5" fill={p.dark} />
    <ellipse cx="18" cy="24.5" rx="4.5" ry="4.5" fill={p.primary} />
    {/* Head */}
    <circle cx="18" cy="16" r="4" fill={p.dark} />
    <circle cx="18" cy="15.8" r="3.6" fill={p.primary} />
    {/* Pointed ears */}
    <polygon points="13,15 15,8 17,14" fill={p.primary} />
    <polygon points="19,14 21,8 23,15" fill={p.primary} />
    <polygon points="13.8,14.5 15,9.5 16.5,14" fill={p.secondary} opacity="0.4" />
    <polygon points="19.5,14 21,9.5 22.2,14.5" fill={p.secondary} opacity="0.4" />
    {/* Curved tail */}
    <path d="M23,24 Q27,22 26,17 Q25,14 23,13" stroke={p.dark} strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Nose */}
    {tier >= 2 && <polygon points="17.5,17 18,18 18.5,17" fill={p.accent} opacity="0.5" />}
    {/* Whiskers */}
    {tier >= 3 && (
      <>
        <line x1="14" y1="17" x2="10" y2="16" stroke={p.dark} strokeWidth="0.4" opacity="0.4" />
        <line x1="14" y1="18" x2="10" y2="18.5" stroke={p.dark} strokeWidth="0.4" opacity="0.4" />
        <line x1="22" y1="17" x2="26" y2="16" stroke={p.dark} strokeWidth="0.4" opacity="0.4" />
        <line x1="22" y1="18" x2="26" y2="18.5" stroke={p.dark} strokeWidth="0.4" opacity="0.4" />
      </>
    )}
  </g>
)

// ═══════════════════════════════════════════════════════════════
// STRUCTURES (5-9)
// ═══════════════════════════════════════════════════════════════

// 5. Stone Lantern (tōrō) — base, pillar, fire box, pyramid roof
const drawStoneLantern: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Wide base */}
    <rect x="12" y="28" width="12" height="2" rx="0.5" fill={p.dark} />
    {/* Pillar */}
    <rect x="16" y="20" width="4" height="8" rx="0.5" fill={p.primary} />
    {/* Fire box */}
    <rect x="13" y="16" width="10" height="5" rx="1" fill={p.dark} />
    {/* Window cutouts */}
    <rect x="14.5" y="17.5" width="2.5" height="2" rx="0.3" fill={p.accent} opacity={tier >= 2 ? 0.7 : 0.35} />
    <rect x="19" y="17.5" width="2.5" height="2" rx="0.3" fill={p.accent} opacity={tier >= 2 ? 0.65 : 0.3} />
    {/* Pyramid roof */}
    <path d="M11,16 L18,10 L25,16Z" fill={p.primary} />
    <path d="M12,16 L18,11 L24,16Z" fill={p.secondary} opacity="0.5" />
    {/* Warm glow */}
    {tier >= 3 && <circle cx="18" cy="18" r="4" fill={p.accent} opacity="0.15" />}
  </g>
)

// 6. Tiered Fountain — 3 stacked bowls
const drawFountain: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="7" ry="1.2" fill="rgba(0,0,0,0.06)" />
    {/* Bottom bowl */}
    <path d="M8,26 Q8,30 18,30 Q28,30 28,26" fill={p.dark} />
    <path d="M9,26 Q9,29 18,29 Q27,29 27,26" fill={p.primary} />
    <ellipse cx="18" cy="26" rx="10" ry="2.5" fill={p.secondary} opacity="0.4" />
    {/* Middle bowl */}
    <rect x="16.5" y="22" width="3" height="4" fill={p.dark} />
    <path d="M12,20 Q12,23 18,23 Q24,23 24,20" fill={p.dark} />
    <path d="M13,20 Q13,22 18,22 Q23,22 23,20" fill={p.primary} />
    <ellipse cx="18" cy="20" rx="6" ry="1.8" fill={p.secondary} opacity="0.4" />
    {/* Top bowl */}
    <rect x="17" y="16" width="2" height="4" fill={p.dark} />
    <path d="M15,15 Q15,17 18,17 Q21,17 21,15" fill={p.dark} />
    <path d="M15.5,15" fill={p.primary} />
    <ellipse cx="18" cy="15" rx="3.5" ry="1.2" fill={p.secondary} opacity="0.5" />
    {/* Water cascade lines */}
    {tier >= 2 && (
      <>
        <line x1="15" y1="17" x2="13" y2="20" stroke={p.accent} strokeWidth="0.5" opacity="0.4" />
        <line x1="21" y1="17" x2="23" y2="20" stroke={p.accent} strokeWidth="0.5" opacity="0.4" />
        <line x1="12" y1="23" x2="10" y2="26" stroke={p.accent} strokeWidth="0.5" opacity="0.3" />
        <line x1="24" y1="23" x2="26" y2="26" stroke={p.accent} strokeWidth="0.5" opacity="0.3" />
      </>
    )}
    {/* Finial on top */}
    {tier >= 3 && <circle cx="18" cy="13" r="1.5" fill={p.accent} opacity="0.5" />}
  </g>
)

// 7. Wishing Well — stone cylinder, two posts, A-frame roof
const drawWishingWell: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Stone base cylinder */}
    <rect x="12" y="22" width="12" height="8" rx="2" fill={p.dark} />
    <rect x="12.5" y="22.5" width="11" height="7" rx="1.5" fill={p.primary} />
    <ellipse cx="18" cy="22" rx="6" ry="2" fill={p.secondary} opacity="0.4" />
    {/* Two posts */}
    <rect x="12" y="12" width="1.5" height="12" fill={p.dark} />
    <rect x="22.5" y="12" width="1.5" height="12" fill={p.dark} />
    {/* A-frame roof */}
    <path d="M10,14 L18,8 L26,14Z" fill={p.dark} />
    <path d="M11,14 L18,9 L25,14Z" fill={p.primary} />
    {/* Crossbar */}
    <rect x="12" y="14" width="12" height="1" fill={p.dark} />
    {/* Rope */}
    {tier >= 2 && <path d="M18,14 Q19,17 18,20" stroke={p.secondary} strokeWidth="0.7" fill="none" />}
    {/* Bucket */}
    {tier >= 3 && (
      <g>
        <rect x="16" y="19" width="4" height="3" rx="0.5" fill={p.dark} />
        <path d="M16,19 Q18,17.5 20,19" stroke={p.secondary} strokeWidth="0.5" fill="none" />
      </g>
    )}
  </g>
)

// 8. Birdhouse — pentagon house on a post
const drawBirdhouse: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="4" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Post */}
    <rect x="17" y="22" width="2" height="8" fill={p.dark} />
    <rect x="17.2" y="22.2" width="1.6" height="7.6" fill={p.primary} />
    {/* House body */}
    <rect x="12" y="16" width="12" height="7" rx="1" fill={p.dark} />
    <rect x="12.5" y="16.5" width="11" height="6" rx="0.8" fill={p.primary} />
    {/* Roof — triangle */}
    <path d="M10,16 L18,9 L26,16Z" fill={p.dark} />
    <path d="M11,16 L18,10 L25,16Z" fill={p.secondary} />
    {/* Entrance hole */}
    <circle cx="18" cy="19.5" r="1.8" fill={p.dark} />
    {/* Perch */}
    {tier >= 2 && <line x1="18" y1="22" x2="18" y2="23.5" stroke={p.dark} strokeWidth="1" strokeLinecap="round" />}
    {tier >= 2 && <line x1="16" y1="23" x2="20" y2="23" stroke={p.dark} strokeWidth="0.8" strokeLinecap="round" />}
    {/* Bird on top */}
    {tier >= 3 && (
      <g>
        <ellipse cx="18" cy="8" rx="2.2" ry="1.5" fill={p.dark} />
        <circle cx="19.5" cy="7.2" r="1.2" fill={p.dark} />
        <polygon points="20.7,7.2 22,7 20.7,7.5" fill={p.accent} />
      </g>
    )}
  </g>
)

// 9. Mini Pagoda — 3 stacked roofs getting smaller
const drawPagoda: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Base */}
    <rect x="13" y="28" width="10" height="2" rx="0.5" fill={p.dark} />
    {/* First level */}
    <rect x="14" y="23" width="8" height="5" rx="0.5" fill={p.primary} />
    <path d="M10,23 L18,20 L26,23Z" fill={p.dark} />
    <path d="M11,23 L18,20.5 L25,23Z" fill={p.primary} />
    {/* Second level */}
    <rect x="15" y="17" width="6" height="4" rx="0.5" fill={p.primary} opacity="0.9" />
    <path d="M12,17 L18,14 L24,17Z" fill={p.dark} />
    <path d="M13,17 L18,14.5 L23,17Z" fill={p.secondary} />
    {/* Third level */}
    <rect x="16" y="12" width="4" height="3" rx="0.5" fill={p.secondary} opacity="0.8" />
    <path d="M14,12 L18,9 L22,12Z" fill={p.dark} />
    <path d="M14.5,12 L18,9.5 L21.5,12Z" fill={p.secondary} opacity="0.7" />
    {/* Spire */}
    {tier >= 2 && <line x1="18" y1="9" x2="18" y2="6" stroke={p.dark} strokeWidth="1" strokeLinecap="round" />}
    {/* Ornamental ball on spire */}
    {tier >= 3 && <circle cx="18" cy="5.5" r="1.2" fill={p.accent} opacity="0.6" />}
  </g>
)

// ═══════════════════════════════════════════════════════════════
// GARDEN INSTRUMENTS (10-14)
// ═══════════════════════════════════════════════════════════════

// 10. Sundial — circular face on pedestal with triangle gnomon
const drawSundial: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="6" ry="1.2" fill="rgba(0,0,0,0.06)" />
    {/* Pedestal */}
    <rect x="15" y="24" width="6" height="6" rx="1" fill={p.dark} />
    <rect x="15.5" y="24.5" width="5" height="5" rx="0.8" fill={p.primary} />
    {/* Circular face — tilted as ellipse */}
    <ellipse cx="18" cy="22" rx="8" ry="3" fill={p.dark} />
    <ellipse cx="18" cy="21.7" rx="7.5" ry="2.7" fill={p.primary} />
    <ellipse cx="18" cy="21.5" rx="6.5" ry="2.2" fill={p.secondary} opacity="0.4" />
    {/* Gnomon — triangle sticking up */}
    <polygon points="18,22 18,14 20,21" fill={p.dark} opacity="0.7" />
    {/* Hour marks */}
    {tier >= 2 && (
      <>
        <circle cx="12" cy="21.5" r="0.5" fill={p.dark} opacity="0.5" />
        <circle cx="15" cy="20" r="0.5" fill={p.dark} opacity="0.5" />
        <circle cx="21" cy="20" r="0.5" fill={p.dark} opacity="0.5" />
        <circle cx="24" cy="21.5" r="0.5" fill={p.dark} opacity="0.5" />
      </>
    )}
    {/* More marks */}
    {tier >= 3 && (
      <>
        <circle cx="13" cy="23" r="0.4" fill={p.dark} opacity="0.4" />
        <circle cx="23" cy="23" r="0.4" fill={p.dark} opacity="0.4" />
        <circle cx="18" cy="19.5" r="0.4" fill={p.dark} opacity="0.4" />
      </>
    )}
  </g>
)

// 11. Gazing Ball — large reflective sphere on short pedestal
const drawGazingBall: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="5" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Short pedestal */}
    <path d="M14,30 L15,26 L21,26 L22,30Z" fill={p.dark} />
    <path d="M14.5,30 L15.3,26.5 L20.7,26.5 L21.5,30Z" fill={p.primary} />
    {/* Large sphere */}
    <circle cx="18" cy="18" r="8" fill={p.dark} />
    <circle cx="18" cy="17.8" r="7.5" fill={p.primary} />
    <circle cx="18" cy="17.5" r="6.5" fill={p.secondary} opacity="0.4" />
    {/* Highlight reflection */}
    {tier >= 2 && <ellipse cx="15" cy="14" rx="3" ry="2" fill={p.accent} opacity="0.3" transform="rotate(-20 15 14)" />}
    {/* Ambient glow */}
    {tier >= 3 && <circle cx="18" cy="18" r="9.5" fill={p.accent} opacity="0.1" />}
  </g>
)

// 12. Wind Chimes — horizontal bar with hanging tubes
const drawWindChimes: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="5" ry="0.8" fill="rgba(0,0,0,0.06)" />
    {/* Hanging string to top */}
    <line x1="18" y1="5" x2="18" y2="10" stroke={p.dark} strokeWidth="0.6" />
    {/* Horizontal bar */}
    <rect x="10" y="10" width="16" height="1.5" rx="0.5" fill={p.dark} />
    <rect x="10.3" y="10.3" width="15.4" height="1" rx="0.4" fill={p.primary} />
    {/* 4 hanging tubes of different lengths */}
    <rect x="11.5" y="12" width="1.5" height="10" rx="0.5" fill={p.primary} />
    <rect x="15" y="12" width="1.5" height="14" rx="0.5" fill={p.secondary} />
    <rect x="19" y="12" width="1.5" height="8" rx="0.5" fill={p.primary} />
    <rect x="22.5" y="12" width="1.5" height="12" rx="0.5" fill={p.secondary} />
    {/* 5th tube */}
    {tier >= 2 && <rect x="17" y="12" width="1.2" height="16" rx="0.4" fill={p.primary} opacity="0.8" />}
    {/* Sail/clapper at bottom */}
    {tier >= 3 && (
      <g>
        <line x1="18" y1="11" x2="18" y2="30" stroke={p.dark} strokeWidth="0.4" opacity="0.4" />
        <ellipse cx="18" cy="30" rx="3" ry="1.5" fill={p.accent} opacity="0.4" />
      </g>
    )}
  </g>
)

// 13. Armillary Sphere — nested circle outlines on pedestal
const drawArmillary: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="5" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Pedestal */}
    <path d="M14,30 L15,25 L21,25 L22,30Z" fill={p.dark} />
    <path d="M14.5,30 L15.3,25.5 L20.7,25.5 L21.5,30Z" fill={p.primary} />
    {/* Outer ring */}
    <circle cx="18" cy="17" r="8" stroke={p.dark} strokeWidth="1.2" fill="none" />
    {/* Tilted ring (ellipse) */}
    <ellipse cx="18" cy="17" rx="8" ry="4" stroke={p.primary} strokeWidth="1" fill="none" transform="rotate(25 18 17)" />
    {/* Another tilted ring */}
    <ellipse cx="18" cy="17" rx="7" ry="3" stroke={p.secondary} strokeWidth="0.8" fill="none" transform="rotate(-20 18 17)" />
    {/* Extra ring */}
    {tier >= 2 && <ellipse cx="18" cy="17" rx="5" ry="7.5" stroke={p.primary} strokeWidth="0.7" fill="none" />}
    {/* Center earth ball */}
    {tier >= 3 && <circle cx="18" cy="17" r="2" fill={p.accent} opacity="0.5" />}
  </g>
)

// 14. Garden Bell — bell shape on crossbar between two posts
const drawGardenBell: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="5" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Two posts */}
    <rect x="10" y="10" width="2" height="20" fill={p.dark} />
    <rect x="10.3" y="10.3" width="1.5" height="19.5" fill={p.primary} />
    <rect x="24" y="10" width="2" height="20" fill={p.dark} />
    <rect x="24.3" y="10.3" width="1.5" height="19.5" fill={p.primary} />
    {/* Crossbar */}
    <rect x="10" y="10" width="16" height="2" rx="0.5" fill={p.dark} />
    {/* Bell shape */}
    <path d="M14,12 Q14,14 14,18 Q14,24 10,26 L26,26 Q22,24 22,18 Q22,14 22,12Z" fill={p.dark} />
    <path d="M14.5,12.5 Q14.5,14 14.5,18 Q14.5,23 11,25 L25,25 Q21.5,23 21.5,18 Q21.5,14 21.5,12.5Z" fill={p.primary} />
    {/* Clapper */}
    <line x1="18" y1="12" x2="18" y2="24" stroke={p.dark} strokeWidth="0.6" />
    <circle cx="18" cy="24" r="1.2" fill={p.dark} />
    {/* Ornament on top */}
    {tier >= 2 && <circle cx="18" cy="10" r="1.5" fill={p.accent} opacity="0.5" />}
    {/* Inscription line */}
    {tier >= 3 && (
      <>
        <path d="M15,20 Q18,19 21,20" stroke={p.accent} strokeWidth="0.5" fill="none" opacity="0.4" />
        <path d="M15,22 Q18,21 21,22" stroke={p.accent} strokeWidth="0.5" fill="none" opacity="0.3" />
      </>
    )}
  </g>
)

// ═══════════════════════════════════════════════════════════════
// PLANTERS & FLORA (15-19)
// ═══════════════════════════════════════════════════════════════

// 15. Flower Pot — terracotta trapezoid with bloom
const drawFlowerPot: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Pot — trapezoid */}
    <path d="M12,20 L10,30 L26,30 L24,20Z" fill={p.dark} />
    <path d="M12.5,20.5 L10.8,29.5 L25.2,29.5 L23.5,20.5Z" fill={p.primary} />
    {/* Rim */}
    <rect x="11" y="19" width="14" height="2" rx="0.8" fill={p.dark} />
    <rect x="11.3" y="19.3" width="13.4" height="1.5" rx="0.6" fill={p.secondary} />
    {/* Stem */}
    <line x1="18" y1="19" x2="18" y2="12" stroke={p.dark} strokeWidth="1.2" strokeLinecap="round" />
    {/* Bloom — 5 petal circle arrangement */}
    <circle cx="18" cy="10" r="3" fill={p.accent} opacity="0.6" />
    <circle cx="15.5" cy="11" r="2.5" fill={p.secondary} opacity="0.5" />
    <circle cx="20.5" cy="11" r="2.5" fill={p.secondary} opacity="0.5" />
    <circle cx="18" cy="10" r="1.5" fill={p.dark} opacity="0.3" />
    {/* Leaf */}
    {tier >= 2 && <path d="M16,16 Q13,14 14,12" stroke={p.dark} strokeWidth="0.8" fill="none" strokeLinecap="round" />}
    {tier >= 2 && <path d="M16,16 Q13.5,15 13.5,12.5" fill={p.secondary} opacity="0.4" />}
    {/* Second leaf */}
    {tier >= 3 && <path d="M20,15 Q23,13 22,11" stroke={p.dark} strokeWidth="0.8" fill="none" strokeLinecap="round" />}
    {tier >= 3 && <path d="M20,15 Q22.5,14 22.5,11.5" fill={p.secondary} opacity="0.4" />}
  </g>
)

// 16. Herb Planter — rectangular box with herb sprigs
const drawHerbPlanter: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="8" ry="1.2" fill="rgba(0,0,0,0.06)" />
    {/* Box planter */}
    <rect x="8" y="22" width="20" height="8" rx="1" fill={p.dark} />
    <rect x="8.5" y="22.5" width="19" height="7" rx="0.8" fill={p.primary} />
    {/* Rim */}
    <rect x="7.5" y="21" width="21" height="2" rx="0.5" fill={p.dark} />
    <rect x="8" y="21.3" width="20" height="1.5" rx="0.4" fill={p.secondary} />
    {/* 3 herb sprigs */}
    <line x1="12" y1="21" x2="12" y2="14" stroke={p.dark} strokeWidth="0.8" strokeLinecap="round" />
    <ellipse cx="12" cy="12" rx="2" ry="3" fill={p.secondary} opacity="0.6" />
    <line x1="18" y1="21" x2="18" y2="12" stroke={p.dark} strokeWidth="0.8" strokeLinecap="round" />
    <ellipse cx="18" cy="10" rx="2.5" ry="3.5" fill={p.secondary} opacity="0.5" />
    <line x1="24" y1="21" x2="24" y2="15" stroke={p.dark} strokeWidth="0.8" strokeLinecap="round" />
    <ellipse cx="24" cy="13" rx="2" ry="2.5" fill={p.secondary} opacity="0.6" />
    {/* More leaf detail */}
    {tier >= 2 && (
      <>
        <path d="M11,14 Q9,12 10,10" stroke={p.dark} strokeWidth="0.5" fill="none" />
        <path d="M19,12 Q21,10 20,8" stroke={p.dark} strokeWidth="0.5" fill="none" />
      </>
    )}
    {/* Small flower */}
    {tier >= 3 && <circle cx="18" cy="8" r="1.5" fill={p.accent} opacity="0.5" />}
  </g>
)

// 17. Fairy Mushrooms — cluster of 3
const drawMushrooms: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="7" ry="1.2" fill="rgba(0,0,0,0.06)" />
    {/* Tall center mushroom */}
    <rect x="17" y="18" width="2.5" height="12" rx="1" fill={p.accent} opacity="0.7" />
    <ellipse cx="18.2" cy="17" rx="5" ry="3.5" fill={p.dark} />
    <ellipse cx="18.2" cy="16.5" rx="4.5" ry="3" fill={p.primary} />
    {/* Left shorter mushroom */}
    <rect x="10" y="22" width="2" height="8" rx="0.8" fill={p.accent} opacity="0.6" />
    <ellipse cx="11" cy="21" rx="3.5" ry="2.5" fill={p.dark} />
    <ellipse cx="11" cy="20.5" rx="3" ry="2" fill={p.secondary} />
    {/* Right shortest mushroom */}
    <rect x="23" y="24" width="1.8" height="6" rx="0.7" fill={p.accent} opacity="0.6" />
    <ellipse cx="24" cy="23.5" rx="3" ry="2" fill={p.dark} />
    <ellipse cx="24" cy="23" rx="2.5" ry="1.8" fill={p.primary} opacity="0.9" />
    {/* Spots on caps */}
    {tier >= 2 && (
      <>
        <circle cx="16" cy="15.5" r="0.8" fill={p.accent} opacity="0.5" />
        <circle cx="20" cy="16" r="0.6" fill={p.accent} opacity="0.5" />
        <circle cx="10" cy="20" r="0.5" fill={p.accent} opacity="0.4" />
      </>
    )}
    {/* Moss at base */}
    {tier >= 3 && (
      <>
        <ellipse cx="14" cy="29" rx="3" ry="1" fill={p.secondary} opacity="0.3" />
        <ellipse cx="22" cy="29.5" rx="2" ry="0.8" fill={p.secondary} opacity="0.25" />
      </>
    )}
  </g>
)

// 18. Watering Can — classic profile
const drawWateringCan: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="7" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Body */}
    <path d="M10,18 L10,28 Q10,30 14,30 L24,30 Q26,30 26,28 L26,20 Z" fill={p.dark} />
    <path d="M10.5,18.5 L10.5,28 Q10.5,29.5 14,29.5 L24,29.5 Q25.5,29.5 25.5,28 L25.5,20.5 Z" fill={p.primary} />
    {/* Spout */}
    <path d="M10,22 L4,14 L6,13 L10,20" fill={p.dark} />
    <path d="M10,21.5 L5,14.5 L6,14 L10,20.5" fill={p.primary} opacity="0.9" />
    {/* Sprinkler head */}
    <ellipse cx="5" cy="13.5" rx="2" ry="1.2" fill={p.dark} transform="rotate(-35 5 13.5)" />
    {/* Handle arc */}
    <path d="M22,18 Q24,12 20,10 Q16,8 14,12" stroke={p.dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Sprinkler holes */}
    {tier >= 2 && (
      <>
        <circle cx="4.2" cy="12.8" r="0.3" fill={p.accent} opacity="0.5" />
        <circle cx="5" cy="12.5" r="0.3" fill={p.accent} opacity="0.5" />
        <circle cx="5.8" cy="13" r="0.3" fill={p.accent} opacity="0.5" />
      </>
    )}
    {/* Water drops */}
    {tier >= 3 && (
      <>
        <circle cx="3.5" cy="15" r="0.5" fill={p.accent} opacity="0.4" />
        <circle cx="5" cy="16" r="0.4" fill={p.accent} opacity="0.35" />
        <circle cx="4" cy="17" r="0.5" fill={p.accent} opacity="0.3" />
      </>
    )}
  </g>
)

// 19. Mini Bonsai — small tree in rectangular pot
const drawBonsai: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Rectangular pot */}
    <rect x="11" y="26" width="14" height="4" rx="1" fill={p.dark} />
    <rect x="11.5" y="26.5" width="13" height="3" rx="0.8" fill={p.primary} opacity="0.7" />
    {/* Curved trunk */}
    <path d="M18,26 Q16,22 14,18 Q13,15 15,13" stroke={p.dark} strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Branch */}
    <path d="M16,20 Q19,18 21,16" stroke={p.dark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {/* Circle canopy */}
    <circle cx="14" cy="12" r={tier >= 2 ? 4.5 : 3.5} fill={p.secondary} opacity="0.5" />
    <circle cx="18" cy="14" r={tier >= 2 ? 3.5 : 2.5} fill={p.primary} opacity="0.4" />
    {/* Extra branch/canopy */}
    {tier >= 3 && (
      <>
        <path d="M17,17 Q21,15 22,14" stroke={p.dark} strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="13" r="3" fill={p.secondary} opacity="0.35" />
      </>
    )}
  </g>
)

// ═══════════════════════════════════════════════════════════════
// WHIMSICAL (20-24)
// ═══════════════════════════════════════════════════════════════

// 20. Fairy Door — arched door set into a mound
const drawFairyDoor: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="8" ry="1.5" fill="rgba(0,0,0,0.06)" />
    {/* Mound/stump */}
    <path d="M6,30 Q6,18 18,14 Q30,18 30,30Z" fill={p.dark} />
    <path d="M7,30 Q7,19 18,15 Q29,19 29,30Z" fill={p.primary} opacity="0.7" />
    {/* Arched door */}
    <path d="M14,30 L14,20 Q14,15 18,15 Q22,15 22,20 L22,30Z" fill={p.dark} />
    <path d="M14.5,30 L14.5,20.5 Q14.5,16 18,16 Q21.5,16 21.5,20.5 L21.5,30Z" fill={p.secondary} opacity="0.6" />
    {/* Door handle */}
    <circle cx="20" cy="23" r="0.8" fill={p.accent} opacity="0.6" />
    {/* Hinge lines */}
    {tier >= 2 && (
      <>
        <line x1="15" y1="19" x2="15" y2="20.5" stroke={p.dark} strokeWidth="0.6" />
        <line x1="15" y1="24" x2="15" y2="25.5" stroke={p.dark} strokeWidth="0.6" />
      </>
    )}
    {/* Mushroom beside door */}
    {tier >= 3 && (
      <g>
        <rect x="24" y="26" width="1.5" height="4" rx="0.5" fill={p.accent} opacity="0.5" />
        <ellipse cx="24.8" cy="25.5" rx="2.5" ry="1.5" fill={p.secondary} opacity="0.6" />
      </g>
    )}
  </g>
)

// 21. Garden Sign — wooden post with hanging sign
const drawGardenSign: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="4" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Wooden post */}
    <rect x="17" y="10" width="2.5" height="20" rx="0.5" fill={p.dark} />
    <rect x="17.3" y="10.3" width="2" height="19.4" fill={p.primary} />
    {/* Hanging sign — rectangular */}
    <line x1="12" y1="14" x2="12" y2="12" stroke={p.dark} strokeWidth="0.6" />
    <line x1="23" y1="14" x2="23" y2="12" stroke={p.dark} strokeWidth="0.6" />
    <rect x="10" y="14" width="15" height="8" rx="1" fill={p.dark} />
    <rect x="10.5" y="14.5" width="14" height="7" rx="0.8" fill={p.secondary} />
    {/* Text lines on sign */}
    <line x1="13" y1="17" x2="22" y2="17" stroke={p.dark} strokeWidth="0.5" opacity="0.3" />
    <line x1="14" y1="19" x2="21" y2="19" stroke={p.dark} strokeWidth="0.5" opacity="0.25" />
    {/* Roof cap */}
    {tier >= 2 && (
      <>
        <path d="M9,14 L17.5,10 L25,14Z" fill={p.dark} opacity="0.6" />
        <path d="M9.5,14 L17.5,10.5 L24.5,14Z" fill={p.primary} opacity="0.5" />
      </>
    )}
    {/* Hanging ornament */}
    {tier >= 3 && (
      <g>
        <line x1="18" y1="22" x2="18" y2="25" stroke={p.dark} strokeWidth="0.4" />
        <circle cx="18" cy="25.5" r="1.2" fill={p.accent} opacity="0.5" />
      </g>
    )}
  </g>
)

// 22. Toadstool Seat — large mushroom with thick stem and wide cap
const drawToadstool: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="6" ry="1.2" fill="rgba(0,0,0,0.06)" />
    {/* Thick stem */}
    <rect x="14" y="18" width="8" height="12" rx="2" fill={p.accent} opacity="0.6" />
    <rect x="14.5" y="18.5" width="7" height="11" rx="1.5" fill={p.accent} opacity="0.4" />
    {/* Wide cap */}
    <ellipse cx="18" cy="17" rx="10" ry="5" fill={p.dark} />
    <ellipse cx="18" cy="16.5" rx="9.5" ry="4.5" fill={p.primary} />
    <ellipse cx="18" cy="16" rx="8" ry="3.5" fill={p.secondary} opacity="0.3" />
    {/* Spots on cap */}
    {tier >= 2 && (
      <>
        <circle cx="14" cy="15" r="1.2" fill={p.accent} opacity="0.4" />
        <circle cx="20" cy="14" r="1" fill={p.accent} opacity="0.35" />
        <circle cx="22" cy="16.5" r="0.8" fill={p.accent} opacity="0.3" />
      </>
    )}
    {/* Gill lines under cap */}
    {tier >= 3 && (
      <>
        <line x1="12" y1="19" x2="14" y2="18.5" stroke={p.dark} strokeWidth="0.4" opacity="0.3" />
        <line x1="15" y1="19.5" x2="16" y2="18.5" stroke={p.dark} strokeWidth="0.4" opacity="0.3" />
        <line x1="20" y1="18.5" x2="21" y2="19.5" stroke={p.dark} strokeWidth="0.4" opacity="0.3" />
        <line x1="22" y1="18.5" x2="24" y2="19" stroke={p.dark} strokeWidth="0.4" opacity="0.3" />
      </>
    )}
  </g>
)

// 23. Stone Owl — round body, big eyes, ear tufts
const drawOwl: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Round body */}
    <ellipse cx="18" cy="23" rx="7" ry="7" fill={p.dark} />
    <ellipse cx="18" cy="22.5" rx="6.5" ry="6.5" fill={p.primary} />
    {/* Ear tufts */}
    <polygon points="11,17 13,10 15,16" fill={p.primary} />
    <polygon points="21,16 23,10 25,17" fill={p.primary} />
    {/* Big eyes */}
    <circle cx="15" cy="19" r="3" fill={p.dark} />
    <circle cx="15" cy="19" r="2.5" fill={p.accent} opacity="0.6" />
    <circle cx="15" cy="19" r="1" fill={p.dark} />
    <circle cx="21" cy="19" r="3" fill={p.dark} />
    <circle cx="21" cy="19" r="2.5" fill={p.accent} opacity="0.6" />
    <circle cx="21" cy="19" r="1" fill={p.dark} />
    {/* Beak */}
    <polygon points="17,21 18,23 19,21" fill={p.secondary} />
    {/* Wing detail */}
    {tier >= 2 && (
      <>
        <path d="M11,22 Q10,25 12,28" stroke={p.dark} strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M25,22 Q26,25 24,28" stroke={p.dark} strokeWidth="0.6" fill="none" opacity="0.4" />
      </>
    )}
    {/* Feet */}
    {tier >= 3 && (
      <>
        <path d="M14,29 L12,30 M14,29 L14,30.5 M14,29 L16,30" stroke={p.dark} strokeWidth="0.6" />
        <path d="M22,29 L20,30 M22,29 L22,30.5 M22,29 L24,30" stroke={p.dark} strokeWidth="0.6" />
      </>
    )}
  </g>
)

// 24. Turtle Statue — oval domed shell, head poking out
const drawTurtle: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="8" ry="1.2" fill="rgba(0,0,0,0.06)" />
    {/* Shell — domed oval */}
    <ellipse cx="18" cy="25" rx="8" ry="5" fill={p.dark} />
    <ellipse cx="18" cy="24" rx="7.5" ry="5" fill={p.primary} />
    <ellipse cx="17" cy="22.5" rx="5" ry="3" fill={p.secondary} opacity="0.3" />
    {/* Head poking out front */}
    <ellipse cx="9" cy="25" rx="3" ry="2" fill={p.dark} />
    <ellipse cx="9" cy="24.5" rx="2.5" ry="1.8" fill={p.primary} />
    <circle cx="8" cy="24" r="0.5" fill={p.dark} />
    {/* Small legs */}
    <ellipse cx="12" cy="29" rx="1.5" ry="1" fill={p.dark} opacity="0.6" />
    <ellipse cx="24" cy="29" rx="1.5" ry="1" fill={p.dark} opacity="0.6" />
    {/* Shell pattern lines */}
    {tier >= 2 && (
      <>
        <path d="M13,22 Q18,20 23,22" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M14,25 Q18,23 22,25" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
        <line x1="18" y1="20" x2="18" y2="27" stroke={p.dark} strokeWidth="0.4" opacity="0.25" />
      </>
    )}
    {/* Tail */}
    {tier >= 3 && <path d="M26,25 Q28,25 28,27" stroke={p.dark} strokeWidth="1" fill="none" strokeLinecap="round" />}
  </g>
)

// ═══════════════════════════════════════════════════════════════
// ARTISAN (25-29)
// ═══════════════════════════════════════════════════════════════

// 25. Cairn Stack — 3-5 stacked stones
const drawCairn: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="6" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Bottom stone */}
    <ellipse cx="18" cy="28" rx="7" ry="3" fill={p.dark} opacity="0.5" />
    <ellipse cx="18" cy="27" rx="6.5" ry="2.5" fill={p.primary} />
    {/* 2nd stone */}
    <ellipse cx="17.5" cy="23" rx="5" ry="2.2" fill={p.dark} opacity="0.5" />
    <ellipse cx="17.5" cy="22.5" rx="4.5" ry="2" fill={p.primary} opacity="0.9" />
    {/* 3rd stone */}
    <ellipse cx="18.5" cy="19" rx="3.5" ry="1.8" fill={p.dark} opacity="0.5" />
    <ellipse cx="18.5" cy="18.5" rx="3" ry="1.5" fill={p.secondary} />
    {/* 4th stone */}
    {tier >= 2 && (
      <>
        <ellipse cx="17.8" cy="15.5" rx="2.2" ry="1.2" fill={p.dark} opacity="0.5" />
        <ellipse cx="17.8" cy="15" rx="2" ry="1" fill={p.secondary} opacity="0.8" />
      </>
    )}
    {/* 5th tiny stone */}
    {tier >= 3 && <ellipse cx="18.2" cy="12.5" rx="1.5" ry="0.8" fill={p.accent} opacity="0.6" />}
  </g>
)

// 26. Stepping Stones — 2-3 flat oval stones laid diagonally
const drawSteppingStones: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="8" ry="1.5" fill="rgba(0,0,0,0.04)" />
    {/* First stone */}
    <ellipse cx="13" cy="27" rx="5" ry="2.5" fill={p.dark} opacity="0.5" transform="rotate(-15 13 27)" />
    <ellipse cx="13" cy="26.5" rx="4.5" ry="2" fill={p.primary} transform="rotate(-15 13 26.5)" />
    {/* Second stone */}
    <ellipse cx="20" cy="22" rx="5.5" ry="2.5" fill={p.dark} opacity="0.5" transform="rotate(10 20 22)" />
    <ellipse cx="20" cy="21.5" rx="5" ry="2" fill={p.secondary} transform="rotate(10 20 21.5)" />
    {/* Third stone */}
    {tier >= 2 && (
      <>
        <ellipse cx="14" cy="17" rx="4.5" ry="2.2" fill={p.dark} opacity="0.5" transform="rotate(-5 14 17)" />
        <ellipse cx="14" cy="16.5" rx="4" ry="1.8" fill={p.primary} opacity="0.9" transform="rotate(-5 14 16.5)" />
      </>
    )}
    {/* Moss between stones */}
    {tier >= 3 && (
      <>
        <ellipse cx="16" cy="24" rx="1.5" ry="0.8" fill={p.secondary} opacity="0.3" />
        <ellipse cx="17" cy="19" rx="1.2" ry="0.6" fill={p.secondary} opacity="0.25" />
      </>
    )}
  </g>
)

// 27. Garden Obelisk — tall tapered pillar with pyramid top
const drawObelisk: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="31" rx="5" ry="1" fill="rgba(0,0,0,0.06)" />
    {/* Base */}
    <rect x="13" y="28" width="10" height="2" rx="0.5" fill={p.dark} />
    {/* Tapered pillar */}
    <path d="M14,28 L16,10 L20,10 L22,28Z" fill={p.dark} />
    <path d="M14.5,28 L16.3,10.5 L19.7,10.5 L21.5,28Z" fill={p.primary} />
    {/* Pyramid top */}
    <path d="M16,10 L18,5 L20,10Z" fill={p.dark} />
    <path d="M16.3,10 L18,5.5 L19.7,10Z" fill={p.secondary} />
    {/* Inscription lines */}
    {tier >= 2 && (
      <>
        <line x1="16" y1="16" x2="20" y2="16" stroke={p.accent} strokeWidth="0.4" opacity="0.3" />
        <line x1="16" y1="18" x2="20" y2="18" stroke={p.accent} strokeWidth="0.4" opacity="0.3" />
        <line x1="15.5" y1="20" x2="20.5" y2="20" stroke={p.accent} strokeWidth="0.4" opacity="0.3" />
      </>
    )}
    {/* Sun disk at top */}
    {tier >= 3 && (
      <circle cx="18" cy="8" r="1.5" fill={p.accent} opacity="0.4" />
    )}
  </g>
)

// 28. Bee Skep — dome-shaped traditional beehive with woven texture
const drawBeeSkep: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="30" rx="7" ry="1.2" fill="rgba(0,0,0,0.06)" />
    {/* Dome shape */}
    <path d="M10,30 Q10,14 18,12 Q26,14 26,30Z" fill={p.dark} />
    <path d="M10.5,30 Q10.5,14.5 18,12.5 Q25.5,14.5 25.5,30Z" fill={p.primary} />
    {/* Woven texture lines — horizontal bands */}
    <path d="M11,28 Q18,27 25,28" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
    <path d="M11,25 Q18,24 25,25" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
    <path d="M12,22 Q18,21 24,22" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
    <path d="M13,19 Q18,18 23,19" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
    <path d="M15,16 Q18,15 21,16" stroke={p.dark} strokeWidth="0.5" fill="none" opacity="0.3" />
    {/* Entrance hole */}
    <ellipse cx="18" cy="28" rx="2" ry="1.5" fill={p.dark} />
    {/* Bee */}
    {tier >= 2 && (
      <g>
        <ellipse cx="24" cy="16" rx="1.5" ry="1" fill={p.secondary} opacity="0.7" transform="rotate(-20 24 16)" />
        <line x1="23" y1="15" x2="22" y2="14" stroke={p.dark} strokeWidth="0.3" opacity="0.5" />
        <line x1="25" y1="15" x2="26" y2="14" stroke={p.dark} strokeWidth="0.3" opacity="0.5" />
      </g>
    )}
    {/* Second bee */}
    {tier >= 3 && (
      <g>
        <ellipse cx="10" cy="20" rx="1.3" ry="0.9" fill={p.secondary} opacity="0.6" transform="rotate(15 10 20)" />
        <line x1="9" y1="19" x2="8" y2="18" stroke={p.dark} strokeWidth="0.3" opacity="0.5" />
        <line x1="11" y1="19" x2="12" y2="18" stroke={p.dark} strokeWidth="0.3" opacity="0.5" />
      </g>
    )}
  </g>
)

// 29. Kintsugi Bowl — bowl with gold crack repair lines
const drawKintsugi: DrawFn = (p, tier) => (
  <g>
    <ellipse cx="18" cy="29" rx="8" ry="1.5" fill="rgba(0,0,0,0.06)" />
    {/* Bowl shape */}
    <path d="M8,18 Q8,28 18,28 Q28,28 28,18" fill={p.dark} />
    <path d="M9,18 Q9,27 18,27 Q27,27 27,18" fill={p.primary} />
    <ellipse cx="18" cy="18" rx="10" ry="3" fill={p.secondary} opacity="0.4" />
    {/* Gold crack lines — the beauty of repair */}
    <path d="M12,18 Q14,22 13,27" stroke="#d4a850" strokeWidth="0.8" fill="none" opacity="0.7" />
    <path d="M22,18 Q20,22 21,26" stroke="#d4a850" strokeWidth="0.7" fill="none" opacity="0.65" />
    {/* More cracks */}
    {tier >= 2 && (
      <>
        <path d="M17,18 Q18,22 16,26" stroke="#d4a850" strokeWidth="0.6" fill="none" opacity="0.55" />
        <path d="M14,20 Q16,21 13,24" stroke="#d4a850" strokeWidth="0.5" fill="none" opacity="0.5" />
      </>
    )}
    {/* Most cracks */}
    {tier >= 3 && (
      <>
        <path d="M24,19 Q25,22 24,26" stroke="#d4a850" strokeWidth="0.5" fill="none" opacity="0.5" />
        <path d="M10,20 Q12,21 11,23" stroke="#d4a850" strokeWidth="0.4" fill="none" opacity="0.45" />
        <path d="M19,19 Q20,23 19,26" stroke="#d4a850" strokeWidth="0.4" fill="none" opacity="0.4" />
      </>
    )}
  </g>
)

// ── Master list ──────────────────────────────────────────────
const DRAW_FNS: DrawFn[] = [
  // Statuary (0-4)
  drawBirdBath, drawGnome, drawFrog, drawBunny, drawCat,
  // Structures (5-9)
  drawStoneLantern, drawFountain, drawWishingWell, drawBirdhouse, drawPagoda,
  // Garden Instruments (10-14)
  drawSundial, drawGazingBall, drawWindChimes, drawArmillary, drawGardenBell,
  // Planters & Flora (15-19)
  drawFlowerPot, drawHerbPlanter, drawMushrooms, drawWateringCan, drawBonsai,
  // Whimsical (20-24)
  drawFairyDoor, drawGardenSign, drawToadstool, drawOwl, drawTurtle,
  // Artisan (25-29)
  drawCairn, drawSteppingStones, drawObelisk, drawBeeSkep, drawKintsugi,
]

// ── Public API ───────────────────────────────────────────────

export function getTrophyConfig(variant: number, _tier?: number) {
  const baseType = variant % 30
  const paletteIndex = Math.floor(variant / 30) % 4
  void _tier
  return { baseType, paletteIndex, palette: PALETTES[paletteIndex], name: `${PALETTE_NAMES[paletteIndex]} ${ORNAMENT_NAMES[baseType]}` }
}

export function trophyVariantFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 120)
}

export function trophyTier(stepCount: number): number {
  if (stepCount >= 13) return 4
  if (stepCount >= 8) return 3
  if (stepCount >= 4) return 2
  return 1
}

interface Props {
  size?: number
  variant: number  // 0-119
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
