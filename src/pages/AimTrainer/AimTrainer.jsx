import { useState, useRef, useCallback } from 'react'
import TestShell from '../../components/shared/TestShell'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'
import { randInt } from '../../lib/utils'
import { playClick, playDone, playError } from '../../lib/sounds'

const TOTAL_TARGETS = 30
const TARGET_SIZE = 64

function randomPos(arenaDims) {
  return {
    left: randInt(0, arenaDims.width - TARGET_SIZE),
    top: randInt(0, arenaDims.height - TARGET_SIZE),
  }
}

export default function AimTrainer() {
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [count, setCount] = useState(0)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const [totalMs, setTotalMs] = useState(0)
  const arenaRef = useRef(null)
  const lastClickRef = useRef(null)
  const timesRef = useRef([])
  const { scores, updateScore } = useScores()
  const pb = scores.aim?.best

  function getArenaDims() {
    const el = arenaRef.current
    if (!el) return { width: 700, height: 420 }
    return { width: el.clientWidth, height: el.clientHeight }
  }

  function startGame() {
    timesRef.current = []
    const dims = getArenaDims()
    setPos(randomPos(dims))
    lastClickRef.current = performance.now()
    setCount(1)
    setPhase('running')
  }

  function handleTargetClick(e) {
    e.stopPropagation()
    const now = performance.now()
    const delta = now - lastClickRef.current
    lastClickRef.current = now
    timesRef.current.push(delta)

    const nextCount = count + 1
    if (nextCount > TOTAL_TARGETS) {
      const total = timesRef.current.reduce((a, b) => a + b, 0)
      const perTarget = Math.round(total / timesRef.current.length)
      setTotalMs(perTarget)
      updateScore('aim', perTarget)
      playDone()
      setPhase('done')
    } else {
      playClick()
      const dims = getArenaDims()
      setPos(randomPos(dims))
      setCount(nextCount)
    }
  }

  const pb2 = scores.aim?.best
  const isNewBest = phase === 'done' && isBetter('aim', totalMs, pb2)

  return (
    <TestShell
      title="Aim Trainer"
      description={`Click on ${TOTAL_TARGETS} targets as quickly as possible. Your score is the average time per target.`}
    >
      {phase === 'idle' && (
        <button className="btn btn-primary btn-lg" onClick={startGame}>Start</button>
      )}

      {phase === 'running' && (
        <>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            Target {count} / {TOTAL_TARGETS}
          </div>
          <div className="arena" ref={arenaRef} onClick={playError}>
            <div
              className="target-circle"
              style={{ left: pos.left, top: pos.top, width: TARGET_SIZE, height: TARGET_SIZE }}
              onClick={handleTargetClick}
            />
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="result-screen">
          <div>
            <div className="result-score">{totalMs}</div>
            <div className="result-unit">ms per target</div>
          </div>
          {isNewBest && <div className="result-pb">New Personal Best!</div>}
          {!isNewBest && pb2 !== null && pb2 !== undefined && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Personal best: <strong style={{ color: 'var(--text)' }}>{pb2} ms</strong>
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
