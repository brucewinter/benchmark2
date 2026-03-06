import { useState, useEffect, useRef } from 'react'
import TestShell from '../../components/shared/TestShell'
import SequenceGrid from './SequenceGrid'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'
import { randInt } from '../../lib/utils'
import { playBeep, playSuccess, playLevelUp, playError } from '../../lib/sounds'

const FLASH_ON_MS = 400
const FLASH_GAP_MS = 700 // total time per step (on + off)

// phase: idle | showing | input | correct | gameover
export default function SequenceMemory() {
  const [phase, setPhase] = useState('idle')
  const [sequence, setSequence] = useState([])
  const [userIndex, setUserIndex] = useState(0)
  const [flashIndex, setFlashIndex] = useState(null)
  const [wrongIndex, setWrongIndex] = useState(null)
  const [level, setLevel] = useState(1)
  const timersRef = useRef([])
  const { scores, updateScore } = useScores()
  const pb = scores.sequence?.best

  function clearTimers() {
    timersRef.current.forEach(id => clearTimeout(id))
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  function playSequence(seq) {
    setPhase('showing')
    setFlashIndex(null)

    seq.forEach((tileIdx, step) => {
      const onId = setTimeout(() => {
        playBeep()
        setFlashIndex(tileIdx)
      }, step * FLASH_GAP_MS + 600)
      timersRef.current.push(onId)

      const offId = setTimeout(() => {
        setFlashIndex(null)
      }, step * FLASH_GAP_MS + 600 + FLASH_ON_MS)
      timersRef.current.push(offId)
    })

    const doneId = setTimeout(() => {
      setPhase('input')
      setUserIndex(0)
    }, seq.length * FLASH_GAP_MS + 800)
    timersRef.current.push(doneId)
  }

  function startGame() {
    clearTimers()
    const first = [randInt(0, 8)]
    setSequence(first)
    setLevel(1)
    setWrongIndex(null)
    playSequence(first)
  }

  function handleTileClick(tileIdx) {
    if (phase !== 'input') return

    const expected = sequence[userIndex]
    if (tileIdx !== expected) {
      clearTimers()
      setWrongIndex(tileIdx)
      updateScore('sequence', level - 1)
      playError()
      setPhase('gameover')
      return
    }

    const nextIndex = userIndex + 1
    if (nextIndex >= sequence.length) {
      // Completed the sequence
      const nextSeq = [...sequence, randInt(0, 8)]
      setSequence(nextSeq)
      setLevel(nextSeq.length)
      playLevelUp()
      setPhase('correct')
      const tid = setTimeout(() => {
        playSequence(nextSeq)
      }, 800)
      timersRef.current.push(tid)
    } else {
      setUserIndex(nextIndex)
    }
  }

  const isNewBest = phase === 'gameover' && isBetter('sequence', level - 1, pb)
  const currentLevel = sequence.length

  return (
    <TestShell
      title="Sequence Memory"
      description="A sequence of buttons will light up. Repeat the sequence by clicking the buttons in the same order. The sequence grows by one each round."
    >
      {phase === 'idle' && (
        <button className="btn btn-primary btn-lg" onClick={startGame}>Start</button>
      )}

      {(phase === 'showing' || phase === 'input' || phase === 'correct') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div className="level-badge">Level {currentLevel}</div>
          {phase === 'showing' && (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Watch the sequence...</div>
          )}
          {phase === 'input' && (
            <div style={{ fontSize: 14, color: 'var(--accent)' }}>
              Your turn! ({userIndex}/{sequence.length})
            </div>
          )}
          {phase === 'correct' && (
            <div style={{ fontSize: 14, color: 'var(--good)' }}>Correct! Next level...</div>
          )}
          <SequenceGrid
            flashIndex={flashIndex}
            onTileClick={handleTileClick}
            phase={phase}
            wrongIndex={wrongIndex}
          />
        </div>
      )}

      {phase === 'gameover' && (
        <div className="result-screen">
          <div>
            <div className="result-score">{level - 1}</div>
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
