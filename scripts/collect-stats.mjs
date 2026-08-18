// Collects accumulated progress stats from Supabase and writes them to
// stats/history.jsonl (append-only) + STATS.md (regenerated, newest first).
// Zero dependencies — uses Node 20's global fetch. Run from repo root.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'

const BASE = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_KEY

if (!BASE || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY env vars.')
  process.exit(1)
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` }

// Exact row count via PostgREST HEAD + content-range header (no body).
async function count(table, query = '') {
  const url = `${BASE}/rest/v1/${table}${query ? `?${query}` : ''}`
  const res = await fetch(url, { method: 'HEAD', headers: { ...headers, Prefer: 'count=exact' } })
  if (!res.ok) throw new Error(`count ${table} -> HTTP ${res.status}`)
  const cr = res.headers.get('content-range') || '*/0'
  return parseInt(cr.split('/')[1] || '0', 10)
}

async function rows(table, query = '') {
  const url = `${BASE}/rest/v1/${table}${query ? `?${query}` : ''}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`select ${table} -> HTTP ${res.status}`)
  return res.json()
}

const [
  tasksCompleted,
  tasksTotal,
  prayers,
  pomodoros,
  habitsActive,
  gardenArtifacts,
  pomoRows,
  streakRow,
] = await Promise.all([
  count('items', 'item_type=eq.task&completed=eq.true'),
  count('items', 'item_type=eq.task'),
  count('items', 'item_type=eq.prayer'),
  count('pomodoros_v2'),
  count('habit_templates', 'retired=eq.false'),
  count('garden_artifacts'),
  rows('pomodoros_v2', 'select=duration_minutes'),
  rows('habit_templates', 'select=best_streak&order=best_streak.desc&limit=1'),
])

const focusMinutes = pomoRows.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)
const bestStreak = streakRow[0]?.best_streak ?? 0

// Date comes from the CI runner clock (UTC).
const date = new Date().toISOString().slice(0, 10)

const record = {
  date,
  tasksCompleted,
  tasksTotal,
  prayers,
  pomodoros,
  focusMinutes,
  habitsActive,
  bestStreak,
  gardenArtifacts,
}

// Row-level security returns empty sets rather than erroring, so a key without
// access looks exactly like an empty database. Detect that below.
const everythingZero = tasksTotal === 0 && pomodoros === 0 && habitsActive === 0 && prayers === 0

mkdirSync('stats', { recursive: true })

// Append to the machine-readable log (one JSON object per line).
const jsonlPath = 'stats/history.jsonl'
const existing = existsSync(jsonlPath)
  ? readFileSync(jsonlPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  : []

if (everythingZero && existing.some((r) => r.tasksTotal > 0)) {
  console.error(
    'Every count came back zero but earlier runs recorded data. The key in ' +
    'SUPABASE_KEY is most likely blocked by row-level security — it needs to be ' +
    'the service-role key. Refusing to overwrite the log with zeros.',
  )
  process.exit(1)
}

// Replace same-day entry if the job runs more than once in a day.
const history = existing.filter((r) => r.date !== date)
history.push(record)
history.sort((a, b) => a.date.localeCompare(b.date))
writeFileSync(jsonlPath, history.map((r) => JSON.stringify(r)).join('\n') + '\n')

// Regenerate the human-readable table (newest first).
const cols = [
  ['date', 'Date'],
  ['tasksCompleted', 'Tasks done'],
  ['tasksTotal', 'Tasks total'],
  ['prayers', 'Prayers'],
  ['pomodoros', 'Pomodoros'],
  ['focusMinutes', 'Focus min'],
  ['habitsActive', 'Active habits'],
  ['bestStreak', 'Best streak'],
  ['gardenArtifacts', 'Garden'],
]

const header = `| ${cols.map(([, label]) => label).join(' | ')} |`
const sep = `| ${cols.map(() => '---').join(' | ')} |`
const body = [...history]
  .reverse()
  .map((r) => `| ${cols.map(([key]) => r[key]).join(' | ')} |`)
  .join('\n')

const md = `# Progress Log

_Auto-generated weekly by \`.github/workflows/stats-log.yml\`. Do not edit by hand — regenerate from \`stats/history.jsonl\`._

${header}
${sep}
${body}
`

writeFileSync('STATS.md', md)

console.log('Recorded stats:', JSON.stringify(record))
