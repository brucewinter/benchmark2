export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateNumber(digits) {
  let result = ''
  for (let i = 0; i < digits; i++) {
    if (i === 0) {
      result += randInt(1, 9)
    } else {
      result += randInt(0, 9)
    }
  }
  return result
}

export function msToReadable(ms) {
  if (ms === null || ms === undefined) return '—'
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`
}
