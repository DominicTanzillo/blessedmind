interface Props {
  size?: number
  variant: number  // number of notes in the stack
  tier: number     // number of rare colored notes
}

function hashN(n: number): number {
  let h = n * 2654435761
  h = ((h >> 16) ^ h) * 0x45d9f3b
  return ((h >> 16) ^ h) & 0x7fffffff
}

/**
 * NoteStackSVG — a tower of completed sticky notes viewed from profile.
 * Mostly yellow/gold, with occasional rare blue or green notes.
 * Grows taller as variant (note count) increases.
 */
export default function NoteStackSVG({ size = 40, variant, tier }: Props) {
  const noteCount = Math.max(1, Math.min(variant, 20))
  const noteH = Math.max(1.2, Math.min(2.5, 22 / noteCount))
  const baseY = 28

  // Pre-pick which indices get rare colors
  const rareIndices = new Set<number>()
  for (let r = 0; r < Math.min(tier, noteCount); r++) {
    rareIndices.add(hashN(r * 7 + variant) % noteCount)
  }

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
      <ellipse cx="18" cy="31" rx="10" ry="2" fill="rgba(0,0,0,0.06)" />

      {/* Base surface */}
      <rect x="8" y={baseY} width="20" height="2.5" rx="0.5" fill="rgba(120,110,95,0.15)" />

      {/* Stack of notes */}
      {Array.from({ length: noteCount }).map((_, i) => {
        const h = hashN(i + variant * 31)
        const y = baseY - (i + 1) * (noteH + 0.4)
        const xOff = ((h % 5) - 2) * 0.6
        const w = 16 + (h % 5)
        const x = 18 - w / 2 + xOff

        let fill: string
        if (rareIndices.has(i)) {
          fill = h % 2 === 0 ? '#bae6fd' : '#bbf7d0'  // sky blue or mint
        } else {
          const roll = h % 6
          fill = roll < 3 ? '#fde68a' : roll < 5 ? '#fdba74' : '#fecdd3'  // yellow, orange, rose
        }

        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={noteH} rx={0.3}
              fill={fill} stroke="rgba(0,0,0,0.08)" strokeWidth={0.3} />
            {/* Tiny line marks on some notes */}
            {h % 3 === 0 && (
              <>
                <line x1={x + 2} y1={y + noteH * 0.4} x2={x + w - 3} y2={y + noteH * 0.4}
                  stroke="rgba(0,0,0,0.06)" strokeWidth={0.2} />
              </>
            )}
          </g>
        )
      })}

      {/* Top note — slightly larger, more visible */}
      {noteCount > 0 && (() => {
        const topH = hashN(noteCount - 1 + variant * 31)
        const topY = baseY - noteCount * (noteH + 0.4) - 0.5
        const isRare = rareIndices.has(noteCount - 1)
        const topFill = isRare
          ? (topH % 2 === 0 ? '#bae6fd' : '#bbf7d0')
          : '#fde68a'

        return (
          <rect x={9} y={topY} width={18} height={noteH + 0.8} rx={0.5}
            fill={topFill} stroke="rgba(0,0,0,0.1)" strokeWidth={0.3} />
        )
      })()}
    </svg>
  )
}
