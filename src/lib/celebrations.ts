// Variable reward messages - shown intermittently after completing tasks
// Variability triggers dopamine prediction error (Schultz, 1997)
const COMPLETION_MESSAGES = [
  'Well done, good and faithful servant.',
  'That burden has been lifted from your shoulders.',
  'You were faithful with this. More will be entrusted to you.',
  'Cast your anxieties — this one is handled.',
  'The diligent hand makes things happen.',
  'One less stone to carry. Walk lighter.',
  'Sow faithfully, reap abundantly.',
  'Your hands found the work, and it is finished.',
  'Be still now. This one is done.',
  'Commit your work to the Lord, and your plans will be established.',
]

const BATCH_COMPLETE_MESSAGES = [
  'This is the day the Lord has made — and you showed up for it.',
  'Be still and know. Your work is done.',
  'You have run today\'s race. Rest in that.',
  'The Lord gives strength to the weary. You honored that gift.',
  'Well done. Let peace guard your heart and mind.',
  'He who began a good work in you is faithful to complete it.',
  'Your hands were willing and your heart was obedient.',
  'Come to me, all who are weary. You\'ve earned your rest.',
  'Three seeds planted. Trust the harvest.',
]

const EMPTY_STATE_MESSAGES = [
  'Be still, and know that I am God.',
  'In quietness and trust is your strength.',
  'The Lord is your shepherd. You shall not want.',
  'Peace I leave with you. My peace I give to you.',
  'Your mind is clear. Rest in His presence.',
]

const BRAIN_DUMP_MESSAGES = [
  'burden lifted. Cast it here — He cares for you.',
  'thought surrendered. Your mind is freer now.',
  'concern released. Let it rest in capable hands.',
  'weight set down. You don\'t have to carry it alone.',
  'care offloaded. Be anxious for nothing.',
]

export function getCompletionMessage(): string {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)]
}

export function getBatchCompleteMessage(): string {
  return BATCH_COMPLETE_MESSAGES[Math.floor(Math.random() * BATCH_COMPLETE_MESSAGES.length)]
}

export function getEmptyStateMessage(): string {
  return EMPTY_STATE_MESSAGES[Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)]
}

export function getBrainDumpMessage(count: number): string {
  const suffix = BRAIN_DUMP_MESSAGES[Math.floor(Math.random() * BRAIN_DUMP_MESSAGES.length)]
  return `${count} ${suffix}`
}

// Show insight ~40% of the time (variable ratio schedule)
export function shouldShowInsight(): boolean {
  return Math.random() < 0.4
}

// Time-of-day aware greeting
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'The night is nearly over'
  if (hour < 12) return 'His mercies are new this morning'
  if (hour < 17) return 'Walk worthy of this afternoon'
  if (hour < 21) return 'The evening is a gift'
  return 'Rest well tonight'
}

// ── Grind messages ─────────────────────────────────────────

const GRIND_COMPLETION_MESSAGES = [
  'Faithful in the small things.',
  'One more root driven deep.',
  'The seed you planted is growing.',
  'Consistency is its own reward.',
  'Your garden is tended.',
  'A little each day moves mountains.',
]

const GRIND_MILESTONE_MESSAGES: Record<number, string> = {
  3: 'Three days strong. The sprout breaks through.',
  7: 'A full week. Your sapling stands firm.',
  14: 'Two weeks of faithfulness. Watch it bloom.',
  30: 'A month of daily devotion. The tree stands tall.',
}

export function getGrindCompletionMessage(streak: number): string {
  const milestone = GRIND_MILESTONE_MESSAGES[streak]
  if (milestone) return milestone
  return GRIND_COMPLETION_MESSAGES[Math.floor(Math.random() * GRIND_COMPLETION_MESSAGES.length)]
}

export function getTimeContext(): string {
  const hour = new Date().getHours()
  if (hour >= 21 || hour < 6) {
    return 'Lay your burdens down. Tomorrow has enough trouble of its own.'
  }
  if (hour < 12) {
    return 'Commit your day to the Lord. These are your first fruits.'
  }
  return 'You have been faithful with what was set before you.'
}
