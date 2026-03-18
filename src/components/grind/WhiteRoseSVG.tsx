interface Props {
  size?: number
}

/**
 * White rose — prayer completion.
 * Soft cream petals with warm blush edges,
 * golden heart, organic stem with natural thorns.
 * Wabi-sabi: petals are slightly uneven, nothing perfectly symmetric.
 */
export default function WhiteRoseSVG({ size = 48 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-plant-grow"
      style={{ overflow: 'hidden' }}
    >
      {/* Soft ground shadow */}
      <ellipse cx="24" cy="44" rx="7" ry="1.5" fill="rgba(0,0,0,0.05)" />

      <g className="animate-plant-sway" style={{ transformOrigin: '24px 44px' }}>
        {/* Stem — gentle S-curve, not straight */}
        <path d="M24,44 Q23,38 23.5,32 Q24,26 24,21" stroke="#6d8a5a" strokeWidth="1.3" strokeLinecap="round" fill="none" />

        {/* Thorns — tiny, organic */}
        <path d="M23.5,34 Q21.5,33 22,34.5" stroke="#6d8a5a" strokeWidth="0.7" strokeLinecap="round" fill="none" />
        <path d="M24,29 Q26,28 25.5,29.5" stroke="#6d8a5a" strokeWidth="0.7" strokeLinecap="round" fill="none" />

        {/* Leaves — soft, slightly different sizes */}
        <path d="M23.5,38 Q17.5,35 16.5,37.5 Q18,40 23.5,38Z" fill="#7a9a68" />
        <path d="M23.5,38 Q18.5,36 17,37" stroke="#6a8a58" strokeWidth="0.3" fill="none" opacity="0.5" />
        <path d="M24,34 Q29.5,31 30.5,33.5 Q29,36 24,34Z" fill="#88a878" />
        <path d="M24,34 Q28,32 29.5,33" stroke="#6a8a58" strokeWidth="0.3" fill="none" opacity="0.4" />

        {/* Outer petals — warm off-white, blush edges, imperfect */}
        <ellipse cx="20" cy="17.5" rx="4.2" ry="5" fill="#faf5ef" stroke="#e5d0c8" strokeWidth="0.4" transform="rotate(-22 20 17.5)" opacity="0.9" />
        <ellipse cx="28" cy="17" rx="4" ry="5.2" fill="#f8f3ed" stroke="#e5d0c8" strokeWidth="0.4" transform="rotate(18 28 17)" opacity="0.88" />
        <ellipse cx="24" cy="13.5" rx="3.8" ry="5" fill="#fcf8f4" stroke="#e5d0c8" strokeWidth="0.4" transform="rotate(3 24 13.5)" opacity="0.92" />

        {/* Mid petals — slightly cupped inward */}
        <ellipse cx="21.5" cy="20" rx="3.2" ry="4" fill="#f5ede6" stroke="#ddc5bc" strokeWidth="0.35" transform="rotate(-28 21.5 20)" opacity="0.85" />
        <ellipse cx="26.5" cy="19.5" rx="3" ry="4.2" fill="#f5ede6" stroke="#ddc5bc" strokeWidth="0.35" transform="rotate(25 26.5 19.5)" opacity="0.82" />

        {/* Inner petals — slightly warmer, tighter curl */}
        <ellipse cx="23" cy="16.5" rx="2.5" ry="3.5" fill="#fdf8f0" stroke="#dcc0b5" strokeWidth="0.3" transform="rotate(-10 23 16.5)" opacity="0.9" />
        <ellipse cx="25.5" cy="16" rx="2.3" ry="3.2" fill="#fdf8f0" stroke="#dcc0b5" strokeWidth="0.3" transform="rotate(12 25.5 16)" opacity="0.88" />

        {/* Heart — warm golden center */}
        <circle cx="24" cy="17" r="2" fill="#eddcca" />
        <circle cx="24" cy="16.8" r="1.2" fill="#e5ccb0" />
        <circle cx="23.5" cy="16.5" r="0.5" fill="#d8b898" opacity="0.6" />
      </g>
    </svg>
  )
}
