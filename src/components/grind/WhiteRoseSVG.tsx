interface Props {
  size?: number
}

/** Stylized white rose for completed prayers in the terrarium */
export default function WhiteRoseSVG({ size = 48 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-plant-grow"
    >
      {/* Ground shadow */}
      <ellipse cx="24" cy="42" rx="8" ry="1.5" fill="rgba(0,0,0,0.08)" />

      <g className="animate-plant-sway" style={{ transformOrigin: '24px 42px' }}>
        {/* Stem */}
        <line x1="24" y1="42" x2="24" y2="20" stroke="#6b8f5e" strokeWidth="1.5" strokeLinecap="round" />
        {/* Stem curve / thorn */}
        <line x1="24" y1="32" x2="21" y2="30" stroke="#6b8f5e" strokeWidth="1" strokeLinecap="round" />
        <line x1="24" y1="28" x2="27" y2="26" stroke="#6b8f5e" strokeWidth="1" strokeLinecap="round" />

        {/* Leaves */}
        <path d="M24 36 Q18 33 17 35 Q19 38 24 36Z" fill="#7a9e6d" />
        <path d="M24 34 Q30 31 31 33 Q29 36 24 34Z" fill="#8aad7d" />

        {/* Rose petals — white/cream with subtle pink edges */}
        {/* Outer petals */}
        <ellipse cx="20" cy="17" rx="4" ry="5" fill="#faf5f0" stroke="#e8d5d0" strokeWidth="0.5" transform="rotate(-20 20 17)" />
        <ellipse cx="28" cy="17" rx="4" ry="5" fill="#faf5f0" stroke="#e8d5d0" strokeWidth="0.5" transform="rotate(20 28 17)" />
        <ellipse cx="24" cy="13" rx="4" ry="5" fill="#fdf8f5" stroke="#e8d5d0" strokeWidth="0.5" />
        <ellipse cx="21" cy="20" rx="3.5" ry="4" fill="#f5ede8" stroke="#dcc8c0" strokeWidth="0.4" transform="rotate(-30 21 20)" />
        <ellipse cx="27" cy="20" rx="3.5" ry="4" fill="#f5ede8" stroke="#dcc8c0" strokeWidth="0.4" transform="rotate(30 27 20)" />

        {/* Inner petals — slightly more golden/cream */}
        <ellipse cx="23" cy="16" rx="2.5" ry="3.5" fill="#fdf8f0" stroke="#e0d0c5" strokeWidth="0.4" transform="rotate(-10 23 16)" />
        <ellipse cx="25" cy="16" rx="2.5" ry="3.5" fill="#fdf8f0" stroke="#e0d0c5" strokeWidth="0.4" transform="rotate(10 25 16)" />

        {/* Center — warm golden */}
        <circle cx="24" cy="16.5" r="1.8" fill="#f0e0c8" />
        <circle cx="24" cy="16.5" r="1" fill="#e8d0a8" />
      </g>
    </svg>
  )
}
