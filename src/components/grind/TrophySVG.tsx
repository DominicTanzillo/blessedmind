interface Props {
  size?: number
}

/** Sword-in-earth trophy for completed hydra tasks */
export default function TrophySVG({ size = 36 }: Props) {
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
      <ellipse cx="18" cy="32" rx="7" ry="2" fill="rgba(0,0,0,0.08)" />

      {/* Earth mound */}
      <ellipse cx="18" cy="31" rx="8" ry="3.5" fill="#7a6e5e" />
      <ellipse cx="18" cy="30.5" rx="7" ry="2.5" fill="#8a7e6e" />

      {/* Grass at base */}
      <path d="M12 30 Q13 26 14 30" stroke="#6b8f5e" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M15 29 Q16 25 17 29" stroke="#7a9e6d" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M20 29 Q21 25 22 29" stroke="#6b8f5e" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M23 30 Q24 27 25 30" stroke="#8aad7d" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Blade — silver */}
      <path d="M18 5 L20 27 L18 28 L16 27 Z" fill="#c0c8d0" />
      <path d="M18 5 L18 28 L16 27 Z" fill="#d8dde2" />
      {/* Blade edge highlight */}
      <line x1="18" y1="6" x2="18" y2="26" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />

      {/* Crossguard — bronze */}
      <rect x="12" y="24" width="12" height="2.5" rx="1" fill="#b08d57" />
      <rect x="12" y="24" width="12" height="1.2" rx="0.6" fill="#c4a06a" />

      {/* Grip — leather */}
      <rect x="16.5" y="26.5" width="3" height="4" rx="0.5" fill="#6b4e3d" />
      <line x1="17" y1="27.5" x2="19" y2="27.5" stroke="#5a3e2e" strokeWidth="0.5" />
      <line x1="17" y1="28.5" x2="19" y2="28.5" stroke="#5a3e2e" strokeWidth="0.5" />
      <line x1="17" y1="29.5" x2="19" y2="29.5" stroke="#5a3e2e" strokeWidth="0.5" />

      {/* Pommel */}
      <circle cx="18" cy="31" r="1.5" fill="#b08d57" />
      <circle cx="18" cy="31" r="0.8" fill="#c4a06a" />
    </svg>
  )
}
