import { useState, useRef, useCallback } from 'react'
import TestShell from '../../components/shared/TestShell'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'

const TOTAL_TRIALS = 5

// phase: idle | waiting | ready | early | result | done
export default function ReactionTime() {
  const [phase, setPhase] = useState('idle')
  const [trials, setTrials] = useState([])
  const [lastMs, setLastMs] = useState(null)
  const timeoutRef = useRef(null)
  const startRef = useRef(null)
  const { scores, updateScore } = useScores()

  const pb = scores.reaction?.best

  function startTrial() {
    setPhase('waiting')
    const delay = 2000 + Math.random() * 4000
    timeoutRef.current = setTimeout(() => {
      startRef.current = performance.now()
      setPhase('ready')
    }, delay)
  }

  function handleClick() {
    if (phase === 'idle' || phase === 'done') {
      setTrials([])
      setLastMs(null)
      startTrial()
      return
    }

    if (phase === 'waiting') {
      clearTimeout(timeoutRef.current)
      setPhase('early')
      return
    }

    if (phase === 'early' || phase === 'result') {
      startTrial()
      return
    }

    if (phase === 'ready') {
      const ms = Math.round(performance.now() - startRef.current)
      setLastMs(ms)
      const newTrials = [...trials, ms]
      setTrials(newTrials)

      if (newTrials.length >= TOTAL_TRIALS) {
        const avg = Math.round(newTrials.reduce((a, b) => a + b, 0) / newTrials.length)
        updateScore('reaction', avg)
        setPhase('done')
      } else {
        setPhase('result')
      }
      return
    }
  }

  const avg = trials.length > 0
    ? Math.round(trials.reduce((a, b) => a + b, 0) / trials.length)
    : null

  const isNewBest = phase === 'done' && avg !== null && isBetter('reaction', avg, pb)

  return (
    <TestShell
      title="Reaction Time"
      description="When the screen turns green, click as fast as you can. 5 trials will be averaged."
    >
      <div
        className={`reaction-arena ${phase}`}
        onClick={handleClick}
        style={{ width: '100%', maxWidth: 700 }}
      >
        {phase === 'idle' && (
          <>
            <div className="reaction-msg">Click to start</div>
            <div className="reaction-sub">Wait for green, then click!</div>
          </>
        )}

        {phase === 'waiting' && (
          <div className="reaction-msg" style={{ color: '#0d1117' }}>Wait for it...</div>
        )}

        {phase === 'ready' && (
          <div className="reaction-msg" style={{ color: '#0d1117' }}>Click!</div>
        )}

        {phase === 'early' && (
          <>
            <div className="reaction-msg">Too soon!</div>
            <div className="reaction-sub">Click to try again</div>
          </>
        )}

        {phase === 'result' && (
          <>
            <div className="reaction-msg">{lastMs} ms</div>
            <div className="reaction-sub">Trial {trials.length}/{TOTAL_TRIALS} — click for next</div>
            <div className="reaction-trials">
              {Array.from({ length: TOTAL_TRIALS }, (_, i) => (
                <div key={i} className={`trial-dot ${i < trials.length ? 'done' : ''}`} />
              ))}
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="reaction-msg">{avg} ms average</div>
            {isNewBest && (
              <div className="result-pb" style={{ marginTop: 8 }}>New Personal Best!</div>
            )}
            {!isNewBest && pb !== null && pb !== undefined && (
              <div className="reaction-sub">Personal best: {pb} ms</div>
            )}
            <div className="reaction-trials" style={{ marginTop: 8 }}>
              {trials.map((t, i) => (
                <div key={i} className="trial-dot done" title={`${t}ms`} />
              ))}
            </div>
            <div className="reaction-sub" style={{ marginTop: 8 }}>Click to play again</div>
          </>
        )}
      </div>

      {phase === 'result' && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          Trials: {trials.map((t, i) => (
            <span key={i} style={{ marginLeft: 8, color: 'var(--text)' }}>{t}ms</span>
          ))}
        </div>
      )}
    </TestShell>
  )
}
