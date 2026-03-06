import { useState, useEffect, useRef } from 'react'
import TestShell from '../../components/shared/TestShell'
import VisualGrid from './VisualGrid'
import LivesDisplay from '../../components/shared/LivesDisplay'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'
import { shuffle } from '../../lib/utils'
import { playClick, playLevelUp, playError, playDone } from '../../lib/sounds'

const MAX_LIVES = 3
const REVEAL_MS = 3000

function getGridSize(score) {
  return 5 + Math.floor(score / 3)
}

function getHighlightCount(score, size) {
  return Math.min(5 + Math.floor(score / 2), size * size - 2)
}

function buildPattern(size, count) {
  const indices = shuffle(Array.from({ length: size * size }, (_, i) => i))
  return new Set(indices.slice(0, count))
}

// phase: idle | showing | input | gameover
export default function VisualMemory() {
  const [phase, setPhase] = useState('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [size, setSize] = useState(3)
  const [highlighted, setHighlighted] = useState(new Set())
  const [picked, setPicked] = useState(new Map())
  const [remaining, setRemaining] = useState(0)
  const timeoutRef = useRef(null)
  const { scores, updateScore } = useScores()
  const pb = scores.visual?.best

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function startRound(sc, lv) {
    const sz = getGridSize(sc)
    const count = getHighlightCount(sc, sz)
    const pat = buildPattern(sz, count)
    setSize(sz)
    setHighlighted(pat)
    setPicked(new Map())
    setRemaining(count)
    setPhase('showing')
    timeoutRef.current = setTimeout(() => {
      setPhase('input')
    }, REVEAL_MS)
  }

  function startGame() {
    clearTimeout(timeoutRef.current)
    setScore(0)
    setLives(MAX_LIVES)
    startRound(0, MAX_LIVES)
  }

  function handleTileClick(i) {
    if (phase !== 'input') return
    if (picked.has(i)) return

    const isCorrect = highlighted.has(i)
    const newPicked = new Map(picked)
    newPicked.set(i, isCorrect)
    setPicked(newPicked)

    if (isCorrect) {
      const newRemaining = remaining - 1
      setRemaining(newRemaining)
      if (newRemaining <= 0) {
        // Round complete!
        const newScore = score + 1
        setScore(newScore)
        playLevelUp()
        timeoutRef.current = setTimeout(() => {
          startRound(newScore, lives)
        }, 800)
      } else {
        playClick()
      }
    } else {
      // Wrong tile
      playError()
      const newLives = lives - 1
      setLives(newLives)
      if (newLives <= 0) {
        updateScore('visual', score)
        playDone()
        setPhase('gameover')
      } else {
        // Show mistake briefly then restart same round
        timeoutRef.current = setTimeout(() => {
          startRound(score, newLives)
        }, 1200)
      }
    }
  }

  const isNewBest = phase === 'gameover' && isBetter('visual', score, pb)

  return (
    <TestShell
      title="Visual Memory"
      description="Squares will flash on the grid. Click the squares that were highlighted. The grid grows larger as you progress."
    >
      {phase === 'idle' && (
        <button className="btn btn-primary btn-lg" onClick={startGame}>Start</button>
      )}

      {(phase === 'showing' || phase === 'input') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div className="level-badge">Score {score}</div>
            <LivesDisplay lives={lives} max={MAX_LIVES} />
          </div>
          {phase === 'showing' && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Memorize the squares!</div>
          )}
          {phase === 'input' && (
            <div style={{ fontSize: 13, color: 'var(--accent)' }}>Click the highlighted squares ({remaining} left)</div>
          )}
          <VisualGrid
            key={`${size}-${score}`}
            size={size}
            highlighted={highlighted}
            picked={picked}
            phase={phase}
            onTileClick={handleTileClick}
          />
        </div>
      )}

      {phase === 'gameover' && (
        <div className="result-screen">
          <div>
            <div className="result-score">{score}</div>
            <div className="result-unit">score</div>
          </div>
          {isNewBest && <div className="result-pb">New Personal Best!</div>}
          {!isNewBest && pb !== null && pb !== undefined && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Personal best: <strong style={{ color: 'var(--text)' }}>{pb}</strong>
            </div>
          )}
          <div className="result-actions">
            <button className="btn btn-primary" onClick={startGame}>Try Again</button>
            <a href="/" className="btn btn-secondary">Home</a>
          </div>
        </div>
      )}
    </TestShell>
  )
}
