interface Props {
  size?: number
}

/** Three white roses clustered together — reward for completing a time audit */
export default function AuditBouquetSVG({ size = 36 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-plant-grow"
    >
      {/* Ground shadow */}
      <ellipse cx="18" cy="33" rx="6" ry="1.2" fill="rgba(0,0,0,0.06)" />

      {/* Stems */}
      <line x1="14" y1="32" x2="16" y2="16" stroke="#6b8f5e" strokeWidth="1" strokeLinecap="round" />
      <line x1="18" y1="32" x2="18" y2="13" stroke="#6b8f5e" strokeWidth="1" strokeLinecap="round" />
      <line x1="22" y1="32" x2="20" y2="15" stroke="#6b8f5e" strokeWidth="1" strokeLinecap="round" />

      {/* Sage ribbon tie */}
      <path d="M14 28 Q18 26 22 28" stroke="#95a383" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M16 28 Q15 31 14 32" stroke="#95a383" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M20 28 Q21 31 22 32" stroke="#95a383" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Leaves */}
      <path d="M16 24 Q12 22 13 24 Q14 26 16 24Z" fill="#7a9e6d" />
      <path d="M20 22 Q24 20 23 22 Q22 24 20 22Z" fill="#8aad7d" />
      <path d="M18 26 Q15 25 16 26.5 Q17 28 18 26Z" fill="#7a9e6d" />

      {/* Rose 1 — left, lower */}
      <g transform="translate(14, 14) scale(0.6)">
        <ellipse cx="-2" cy="0" rx="3" ry="3.5" fill="#faf5f0" stroke="#e8d5d0" strokeWidth="0.5" transform="rotate(-20)" />
        <ellipse cx="2" cy="0" rx="3" ry="3.5" fill="#faf5f0" stroke="#e8d5d0" strokeWidth="0.5" transform="rotate(20)" />
        <ellipse cx="0" cy="-2" rx="2.5" ry="3" fill="#fdf8f5" stroke="#e8d5d0" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="1.5" fill="#f0e0c8" />
        <circle cx="0" cy="0" r="0.8" fill="#e8d0a8" />
      </g>

      {/* Rose 2 — center, highest */}
      <g transform="translate(18, 11) scale(0.6)">
        <ellipse cx="-2" cy="0" rx="3" ry="3.5" fill="#faf5f0" stroke="#e8d5d0" strokeWidth="0.5" transform="rotate(-15)" />
        <ellipse cx="2" cy="0" rx="3" ry="3.5" fill="#faf5f0" stroke="#e8d5d0" strokeWidth="0.5" transform="rotate(15)" />
        <ellipse cx="0" cy="-2" rx="2.5" ry="3" fill="#fdf8f5" stroke="#e8d5d0" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="1.5" fill="#f0e0c8" />
        <circle cx="0" cy="0" r="0.8" fill="#e8d0a8" />
      </g>

      {/* Rose 3 — right, middle height */}
      <g transform="translate(22, 13) scale(0.6)">
        <ellipse cx="-2" cy="0" rx="3" ry="3.5" fill="#faf5f0" stroke="#e8d5d0" strokeWidth="0.5" transform="rotate(-25)" />
        <ellipse cx="2" cy="0" rx="3" ry="3.5" fill="#faf5f0" stroke="#e8d5d0" strokeWidth="0.5" transform="rotate(25)" />
        <ellipse cx="0" cy="-2" rx="2.5" ry="3" fill="#fdf8f5" stroke="#e8d5d0" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="1.5" fill="#f0e0c8" />
        <circle cx="0" cy="0" r="0.8" fill="#e8d0a8" />
      </g>
    </svg>
  )
}
