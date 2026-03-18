interface Props {
  size?: number
}

/**
 * Audit bouquet — three white roses gathered with a soft ribbon.
 * Reward for completing a time audit. Each rose at a different height
 * and angle, tied loosely with sage-green ribbon.
 * Wabi-sabi: roses face slightly different directions, stems curve naturally.
 */
export default function AuditBouquetSVG({ size = 40 }: Props) {
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
      {/* Ground shadow */}
      <ellipse cx="18" cy="33" rx="5" ry="1" fill="rgba(0,0,0,0.04)" />

      {/* Stems — gentle curves, not straight */}
      <path d="M14.5,32 Q15,26 15.5,18" stroke="#6d8a5a" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <path d="M18,32 Q18,24 18,14" stroke="#6d8a5a" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <path d="M21.5,32 Q21,25 20.5,16" stroke="#6d8a5a" strokeWidth="0.9" strokeLinecap="round" fill="none" />

      {/* Ribbon — soft sage, loosely tied */}
      <path d="M14 27 Q18 25.5 22 27" stroke="#8fa37d" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M15.5 27.5 Q15 30 14.5 31" stroke="#8fa37d" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M20.5 27.5 Q21 30 21.5 31" stroke="#8fa37d" strokeWidth="0.8" fill="none" strokeLinecap="round" />

      {/* Leaves — small, varied */}
      <path d="M15.5 24 Q12 22.5 12.5 24.5 Q13.5 26 15.5 24Z" fill="#7a9a68" />
      <path d="M20 22 Q23 20.5 23 22.5 Q22 24 20 22Z" fill="#88a878" />

      {/* Rose 1 — left, slightly lower */}
      <g transform="translate(15, 16)">
        <ellipse cx="-1.5" cy="0.5" rx="2.5" ry="3" fill="#faf5ef" stroke="#e5d0c8" strokeWidth="0.3" transform="rotate(-18)" opacity="0.88" />
        <ellipse cx="1.5" cy="0.5" rx="2.5" ry="3" fill="#f8f3ed" stroke="#e5d0c8" strokeWidth="0.3" transform="rotate(15)" opacity="0.85" />
        <ellipse cx="0" cy="-1.5" rx="2" ry="2.5" fill="#fcf8f4" stroke="#e5d0c8" strokeWidth="0.3" opacity="0.9" />
        <circle cx="0" cy="0" r="1.2" fill="#eddcca" />
        <circle cx="0" cy="0" r="0.6" fill="#e5ccb0" />
      </g>

      {/* Rose 2 — center, highest */}
      <g transform="translate(18, 12)">
        <ellipse cx="-1.5" cy="0.3" rx="2.8" ry="3.2" fill="#faf5ef" stroke="#e5d0c8" strokeWidth="0.3" transform="rotate(-12)" opacity="0.9" />
        <ellipse cx="1.5" cy="0.3" rx="2.5" ry="3.2" fill="#f8f3ed" stroke="#e5d0c8" strokeWidth="0.3" transform="rotate(10)" opacity="0.87" />
        <ellipse cx="0" cy="-1.8" rx="2.2" ry="2.8" fill="#fcf8f4" stroke="#e5d0c8" strokeWidth="0.3" opacity="0.92" />
        <circle cx="0" cy="0" r="1.3" fill="#eddcca" />
        <circle cx="0" cy="0" r="0.7" fill="#e5ccb0" />
      </g>

      {/* Rose 3 — right, mid height */}
      <g transform="translate(21, 14)">
        <ellipse cx="-1.5" cy="0.5" rx="2.3" ry="2.8" fill="#faf5ef" stroke="#e5d0c8" strokeWidth="0.3" transform="rotate(-22)" opacity="0.86" />
        <ellipse cx="1.5" cy="0.5" rx="2.5" ry="3" fill="#f8f3ed" stroke="#e5d0c8" strokeWidth="0.3" transform="rotate(20)" opacity="0.84" />
        <ellipse cx="0" cy="-1.5" rx="2" ry="2.5" fill="#fcf8f4" stroke="#e5d0c8" strokeWidth="0.3" opacity="0.88" />
        <circle cx="0" cy="0" r="1.1" fill="#eddcca" />
        <circle cx="0" cy="0" r="0.55" fill="#e5ccb0" />
      </g>
    </svg>
  )
}
