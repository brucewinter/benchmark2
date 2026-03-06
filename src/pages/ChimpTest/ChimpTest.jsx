import { useState } from 'react'
import TestShell from '../../components/shared/TestShell'
import ChimpGrid from './ChimpGrid'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'
import { shuffle } from '../../lib/utils'
import { playClick, playLevelUp, playError } from '../../lib/sounds'

const COLS = 5
const ROWS = 5
const TOTAL_CELLS = COLS * ROWS

function buildRound(level) {
  // Place numbers 1..level in random cells of a COLS x ROWS grid
  const positions = shuffle(Array.from({ length: TOTAL_CELLS }, (_, i) => i)).slice(0, level)
  const cells = Array(TOTAL_CELLS).fill(null)
  positions.forEach((pos, idx) => {
    cells[pos] = idx + 1
  })
  return cells
}

// phase: idle | numbers-visible | numbers-hidden | gameover
export default function ChimpTest() {
  const [phase, setPhase] = useState('idle')
  const [level, setLevel] = useState(4)
  const [cells, setCells] = useState([])
  const [numbersVisible, setNumbersVisible] = useState(true)
  const [picked, setPicked] = useState([]) // list of numbers in pick order
  const [nextExpected, setNextExpected] = useState(1)
  const { scores, updateScore } = useScores()
  const pb = scores.chimp?.best

  function startRound(lvl) {
    const newCells = buildRound(lvl)
    setCells(newCells)
    setNumbersVisible(true)
    setPicked([])
    setNextExpected(1)
    setPhase('numbers-visible')
  }

  function startGame() {
    startRound(4)
  }

  function handleCellClick(cellIndex, cellValue) {
    if (phase !== 'numbers-visible' && phase !== 'numbers-hidden') return

    // Hide numbers on first click
    if (numbersVisible && phase === 'numbers-visible') {
      setNumbersVisible(false)
      setPhase('numbers-hidden')
    }

    if (cellValue === null) {
      // Clicked an empty cell — game over
      updateScore('chimp', level - 1 > 3 ? level - 1 : 3)
      playError()
      setPhase('gameover')
      return
    }

    if (cellValue !== nextExpected) {
      // Wrong number
      updateScore('chimp', level - 1 > 3 ? level - 1 : 3)
      playError()
      setPhase('gameover')
      return
    }

    const newPicked = [...picked, cellValue]
    setPicked(newPicked)

    if (newPicked.length >= level) {
      // Round complete — advance level
      const nextLevel = level + 1
      setLevel(nextLevel)
      playLevelUp()
      setTimeout(() => startRound(nextLevel), 800)
    } else {
      playClick()
      setNextExpected(cellValue + 1)
    }
  }

  const isNewBest = phase === 'gameover' && isBetter('chimp', level - 1, pb)

  return (
    <TestShell
      title="Chimp Test"
      description="Numbers will appear briefly on the grid. Click them in order (1, 2, 3...) after they disappear. Numbers hide when you click the first one."
    >
      {phase === 'idle' && (
        <button className="btn btn-primary btn-lg" onClick={startGame}>Start</button>
      )}

      {(phase === 'numbers-visible' || phase === 'numbers-hidden') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="level-badge">Level {level}</div>
          {phase === 'numbers-visible' && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Memorize the positions, then click 1 first
            </div>
          )}
          {phase === 'numbers-hidden' && (
            <div style={{ fontSize: 13, color: 'var(--accent)' }}>
              Click {nextExpected}
            </div>
          )}
          <ChimpGrid
            cells={cells}
            numbersVisible={numbersVisible}
            picked={picked}
            onCellClick={handleCellClick}
            cols={COLS}
          />
        </div>
      )}

      {phase === 'gameover' && (
        <div className="result-screen">
          <div>
            <div className="result-score">{Math.max(level - 1, 3)}</div>
            <div className="result-unit">level</div>
          </div>
          {isNewBest && <div className="result-pb">New Personal Best!</div>}
          {!isNewBest && pb !== null && pb !== undefined && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Personal best: <strong style={{ color: 'var(--text)' }}>Level {pb}</strong>
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
