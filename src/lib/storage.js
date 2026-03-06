const STORAGE_KEY = 'benchmarkScores'

const LOWER_IS_BETTER = new Set(['reaction', 'aim'])

const defaults = {
  reaction: { best: null },
  sequence: { best: null },
  number:   { best: null },
  aim:      { best: null },
  visual:   { best: null },
  chimp:    { best: null },
  verbal:   { best: null },
  typing:   { best: null },
}

export function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaults)
    const parsed = JSON.parse(raw)
    return { ...structuredClone(defaults), ...parsed }
  } catch {
    return structuredClone(defaults)
  }
}

export function saveScores(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch {
    // localStorage unavailable
  }
}

export function isBetter(testId, newVal, currentBest) {
  if (currentBest === null || currentBest === undefined) return true
  if (LOWER_IS_BETTER.has(testId)) return newVal < currentBest
  return newVal > currentBest
}
