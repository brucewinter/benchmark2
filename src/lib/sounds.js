let _ctx = null

function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      return null
    }
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function tone(freq, duration, type = 'sine', volume = 0.25, delay = 0) {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + delay)
  gain.gain.setValueAtTime(0, ac.currentTime + delay)
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + delay + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration)
  osc.start(ac.currentTime + delay)
  osc.stop(ac.currentTime + delay + duration + 0.05)
}

// Short high beep — reaction "go", sequence flash
export function playBeep() {
  tone(880, 0.1, 'sine', 0.2)
}

// Subtle click — aim hit, correct chimp cell, correct tile
export function playClick() {
  tone(660, 0.07, 'sine', 0.15)
}

// Two-note success — correct answer, round passed
export function playSuccess() {
  tone(523, 0.08, 'sine', 0.2)
  tone(784, 0.12, 'sine', 0.2, 0.1)
}

// Three-note fanfare — level up, round complete
export function playLevelUp() {
  tone(523, 0.07, 'sine', 0.18)
  tone(659, 0.07, 'sine', 0.18, 0.09)
  tone(784, 0.14, 'sine', 0.18, 0.18)
}

// Completion jingle — game over with good score
export function playDone() {
  tone(523, 0.08, 'sine', 0.2)
  tone(659, 0.08, 'sine', 0.2, 0.1)
  tone(784, 0.08, 'sine', 0.2, 0.2)
  tone(1047, 0.2, 'sine', 0.2, 0.3)
}

// Error buzz — wrong answer, too early, game over
export function playError() {
  tone(220, 0.18, 'sawtooth', 0.18)
}
