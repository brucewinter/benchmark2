import { useState, useEffect, useRef } from 'react'
import TestShell from '../../components/shared/TestShell'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'
import { generateNumber } from '../../lib/utils'

// phase: idle | showing | input | correct | gameover
export default function NumberMemory() {
  const [phase, setPhase] = useState('idle')
  const [level, setLevel] = useState(1)
  const [number, setNumber] = useState('')
  const [input, setInput] = useState('')
  const [bestLevel, setBestLevel] = useState(0)
  const timeoutRef = useRef(null)
  const inputRef = useRef(null)
  const { scores, updateScore } = useScores()
  const pb = scores.number?.best

  function startLevel(lvl) {
    const num = generateNumber(lvl)
    setNumber(num)
    setInput('')
    setPhase('showing')
    const displayMs = 900 + lvl * 260
    timeoutRef.current = setTimeout(() => {
      setPhase('input')
    }, displayMs)
  }

  useEffect(() => {
    if (phase === 'input' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [phase])

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  function handleStart() {
    setBestLevel(0)
    setLevel(1)
    startLevel(1)
  }

  function handleSubmit() {
    if (input.trim() === number) {
      const nextLevel = level + 1
      setBestLevel(level)
      setLevel(nextLevel)
      setPhase('correct')
      timeoutRef.current = setTimeout(() => {
        startLevel(nextLevel)
      }, 1000)
    } else {
      updateScore('number', level - 1 > 0 ? level - 1 : 0)
      setBestLevel(level - 1)
      setPhase('gameover')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  const isNewBest = phase === 'gameover' && isBetter('number', bestLevel, pb)

  return (
    <TestShell
      title="Number Memory"
      description="Memorize the number, then type it back. The number gets longer each round."
    >
      {phase === 'idle' && (
        <button className="btn btn-primary btn-lg" onClick={handleStart}>Start</button>
      )}

      {phase === 'showing' && (
        <div style={{ textAlign: 'center' }}>
          <div className="level-badge" style={{ marginBottom: 16 }}>Level {level}</div>
          <div className="number-display">{number}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Memorize this number</div>
        </div>
      )}

      {phase === 'input' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="level-badge">Level {level}</div>
          <div className="number-display" style={{ color: 'var(--text-muted)' }}>
            {'?'.repeat(number.length)}
          </div>
          <input
            ref={inputRef}
            className="number-input"
            type="text"
            inputMode="numeric"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the number"
            autoComplete="off"
          />
          <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
        </div>
      )}

      {phase === 'correct' && (
        <div style={{ textAlign: 'center' }}>
          <div className="level-badge" style={{ marginBottom: 16 }}>Level {level - 1} ✓</div>
          <div className="number-display" style={{ color: 'var(--good)' }}>{number}</div>
          <div style={{ fontSize: 14, color: 'var(--good)', marginTop: 8 }}>Correct! Next level...</div>
        </div>
      )}

      {phase === 'gameover' && (
        <div className="result-screen">
          <div>
            <div className="result-score">{bestLevel}</div>
            <div className="result-unit">level</div>
            <div className="result-label" style={{ marginTop: 8, color: 'var(--text-muted)' }}>
              Expected: <strong style={{ color: 'var(--text)' }}>{number}</strong> &nbsp;|&nbsp; You typed: <strong style={{ color: input === number ? 'var(--good)' : 'var(--bad)' }}>{input || '—'}</strong>
            </div>
          </div>
          {isNewBest && <div className="result-pb">New Personal Best!</div>}
          {!isNewBest && pb !== null && pb !== undefined && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Personal best: <strong style={{ color: 'var(--text)' }}>Level {pb}</strong>
            </div>
          )}
          <div className="result-actions">
            <button className="btn btn-primary" onClick={handleStart}>Try Again</button>
            <a href="/" className="btn btn-secondary">Home</a>
          </div>
        </div>
      )}
    </TestShell>
  )
}
