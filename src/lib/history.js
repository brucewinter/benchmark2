const HISTORY_KEY = 'benchmarkHistory'
const MAX_PER_TEST = 50

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // localStorage unavailable
  }
}

export function addHistoryEntry(history, testId, score) {
  const prev = history[testId] || []
  const next = [...prev, { score, ts: Date.now() }].slice(-MAX_PER_TEST)
  return { ...history, [testId]: next }
}
