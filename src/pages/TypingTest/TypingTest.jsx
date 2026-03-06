import { useState, useEffect, useRef, useCallback } from 'react'
import TestShell from '../../components/shared/TestShell'
import TypingDisplay from './TypingDisplay'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'
import { shuffle } from '../../lib/utils'
import { playDone } from '../../lib/sounds'

const DURATION_S = 60

const WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'a', 'pack',
  'of', 'gray', 'wolves', 'had', 'been', 'roaming', 'through', 'forest', 'all',
  'morning', 'searching', 'for', 'prey', 'when', 'they', 'finally', 'spotted',
  'herd', 'deer', 'resting', 'near', 'stream', 'still', 'water', 'reflected',
  'towering', 'pine', 'trees', 'above', 'soft', 'light', 'filtering', 'down',
  'leaves', 'cast', 'dancing', 'shadows', 'on', 'ground', 'below', 'cool',
  'breeze', 'carried', 'scent', 'rain', 'distant', 'mountains', 'clouds',
  'gathered', 'horizon', 'promising', 'storm', 'thunder', 'rumbled', 'low',
  'warning', 'creatures', 'take', 'shelter', 'before', 'night', 'fell',
  'bright', 'stars', 'would', 'hidden', 'thick', 'blanket', 'dark', 'sky',
  'long', 'road', 'stretched', 'ahead', 'travelers', 'weary', 'but', 'determined',
  'reach', 'destination', 'before', 'gates', 'closed', 'ancient', 'city',
  'stone', 'walls', 'high', 'guard', 'towers', 'stood', 'silent', 'sentinels',
  'watching', 'every', 'movement', 'plain', 'below', 'merchants', 'hurried',
  'carts', 'loaded', 'goods', 'from', 'distant', 'lands', 'spices', 'silk',
]

function generatePrompt() {
  const words = shuffle([...WORDS]).slice(0, 60)
  return words.join(' ')
}

// phase: idle | running | done
export default function TypingTest() {
  const [phase, setPhase] = useState('idle')
  const [prompt, setPrompt] = useState(() => generatePrompt())
  const [typed, setTyped] = useState('')
  const [timeLeft, setTimeLeft] = useState(DURATION_S)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const startTimeRef = useRef(null)
  const intervalRef = useRef(null)
  const textareaRef = useRef(null)
  const { scores, updateScore } = useScores()
  const pb = scores.typing?.best

  function endGame(typedText, elapsedS) {
    clearInterval(intervalRef.current)
    const elapsed = Math.max(elapsedS, 1)
    const words = typedText.trim().split(/\s+/).filter(Boolean).length
    const calculatedWpm = Math.round((typedText.length / 5) / (elapsed / 60))
    let correct = 0
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === prompt[i]) correct++
    }
    const acc = typedText.length > 0 ? Math.round((correct / typedText.length) * 100) : 100
    setWpm(calculatedWpm)
    setAccuracy(acc)
    updateScore('typing', calculatedWpm)
    playDone()
    setPhase('done')
  }

  function handleChange(e) {
    const val = e.target.value
    if (val.length > prompt.length) return

    if (phase === 'idle' || (phase !== 'running')) {
      // First keystroke starts the timer
      startTimeRef.current = performance.now()
      intervalRef.current = setInterval(() => {
        const elapsed = (performance.now() - startTimeRef.current) / 1000
        const remaining = Math.max(0, DURATION_S - elapsed)
        setTimeLeft(Math.ceil(remaining))
        if (remaining <= 0) {
          setTyped(val)
          endGame(val, DURATION_S)
        }
      }, 200)
      setPhase('running')
    }

    setTyped(val)

    // Finished prompt early
    if (val.length >= prompt.length) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      endGame(val, elapsed)
    }
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  function resetGame() {
    clearInterval(intervalRef.current)
    setPrompt(generatePrompt())
    setTyped('')
    setTimeLeft(DURATION_S)
    setPhase('idle')
    startTimeRef.current = null
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const progressPct = (timeLeft / DURATION_S) * 100
  const isNewBest = phase === 'done' && isBetter('typing', wpm, pb)

  return (
    <TestShell
      title="Typing Test"
      description="Type the text below as fast and accurately as you can. Timer starts on first keystroke."
    >
      {phase !== 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 700 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 14, color: 'var(--text-muted)' }}>
            <span>Time: <strong style={{ color: phase === 'running' && timeLeft <= 10 ? 'var(--bad)' : 'var(--text)' }}>{timeLeft}s</strong></span>
            <span>Characters: {typed.length}</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <TypingDisplay prompt={prompt} typed={typed} cursorPos={typed.length} />
          <textarea
            ref={textareaRef}
            className="typing-input"
            rows={3}
            value={typed}
            onChange={handleChange}
            onPaste={e => e.preventDefault()}
            placeholder={phase === 'idle' ? 'Start typing to begin...' : ''}
            autoFocus
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      )}

      {phase === 'done' && (
        <div className="result-screen">
          <div className="score-row">
            <div className="score-box">
              <span className="val">{wpm}</span>
              <span className="lbl">WPM</span>
            </div>
            <div className="score-box">
              <span className="val">{accuracy}%</span>
              <span className="lbl">Accuracy</span>
            </div>
          </div>
          {isNewBest && <div className="result-pb">New Personal Best!</div>}
          {!isNewBest && pb !== null && pb !== undefined && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Personal best: <strong style={{ color: 'var(--text)' }}>{pb} WPM</strong>
            </div>
          )}
          <div className="result-actions">
            <button className="btn btn-primary" onClick={resetGame}>Try Again</button>
            <a href="/" className="btn btn-secondary">Home</a>
          </div>
        </div>
      )}
    </TestShell>
  )
}
