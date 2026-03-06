import { useState, useCallback } from 'react'
import TestShell from '../../components/shared/TestShell'
import LivesDisplay from '../../components/shared/LivesDisplay'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'
import { WORD_LIST } from '../../lib/wordList'
import { shuffle } from '../../lib/utils'

const MAX_LIVES = 3

function pickNextWord(seen, pool, usedAll) {
  const seenArr = [...seen]
  // 55% chance to show a previously seen word (if any exist)
  if (seenArr.length > 0 && Math.random() < 0.55) {
    return { word: seenArr[Math.floor(Math.random() * seenArr.length)], isNew: false }
  }
  // show a new word from the pool
  const remaining = pool.filter(w => !seen.has(w))
  if (remaining.length === 0) {
    // pool exhausted — show a random seen word
    return { word: seenArr[Math.floor(Math.random() * seenArr.length)], isNew: false }
  }
  return { word: remaining[Math.floor(Math.random() * remaining.length)], isNew: true }
}

// phase: idle | playing | gameover
export default function VerbalMemory() {
  const [phase, setPhase] = useState('idle')
  const [lives, setLives] = useState(MAX_LIVES)
  const [score, setScore] = useState(0)
  const [seen, setSeen] = useState(new Set())
  const [pool] = useState(() => shuffle(WORD_LIST))
  const [current, setCurrent] = useState(null)
  const [currentIsNew, setCurrentIsNew] = useState(true)
  const { scores, updateScore } = useScores()
  const pb = scores.verbal?.best

  function startGame() {
    const newSeen = new Set()
    const first = pickNextWord(newSeen, pool, false)
    setSeen(new Set())
    setScore(0)
    setLives(MAX_LIVES)
    setCurrent(first.word)
    setCurrentIsNew(first.isNew)
    setPhase('playing')
  }

  function advance(answer) {
    // answer: 'seen' | 'new'
    const correct = (answer === 'seen') === !currentIsNew
    let newLives = lives
    let newScore = score
    let newSeen = new Set(seen)

    if (correct) {
      newScore = score + 1
    } else {
      newLives = lives - 1
    }

    // Add word to seen set regardless
    newSeen.add(current)

    if (newLives <= 0) {
      updateScore('verbal', newScore)
      setScore(newScore)
      setSeen(newSeen)
      setLives(0)
      setPhase('gameover')
      return
    }

    const next = pickNextWord(newSeen, pool, false)
    setScore(newScore)
    setSeen(newSeen)
    setLives(newLives)
    setCurrent(next.word)
    setCurrentIsNew(next.isNew)
  }

  const isNewBest = phase === 'gameover' && isBetter('verbal', score, pb)

  return (
    <TestShell
      title="Verbal Memory"
      description='You will be shown words one at a time. If you have seen the word before in this test, click "SEEN". Otherwise click "NEW".'
    >
      {phase === 'idle' && (
        <button className="btn btn-primary btn-lg" onClick={startGame}>Start</button>
      )}

      {phase === 'playing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div className="verbal-stats">
            <div className="score-box">
              <span className="val">{score}</span>
              <span className="lbl">Score</span>
            </div>
            <div className="score-box">
              <span className="val">{seen.size}</span>
              <span className="lbl">Words seen</span>
            </div>
          </div>
          <LivesDisplay lives={lives} max={MAX_LIVES} />
          <div className="verbal-word">{current}</div>
          <div className="verbal-actions">
            <button className="btn btn-good btn-lg" onClick={() => advance('seen')}>SEEN</button>
            <button className="btn btn-secondary btn-lg" onClick={() => advance('new')}>NEW</button>
          </div>
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
