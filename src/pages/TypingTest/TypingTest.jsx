import { useState, useEffect, useRef, useCallback } from 'react'
import TestShell from '../../components/shared/TestShell'
import TypingDisplay from './TypingDisplay'
import { useScores } from '../../context/ScoresContext'
import { isBetter } from '../../lib/storage'
import { playDone } from '../../lib/sounds'

const DURATION_S = 30

const PASSAGES = [
  'The sun had barely risen when she stepped outside to find the garden covered in a thin layer of frost. Each blade of grass sparkled like a tiny crystal, and her breath formed small clouds in the cold morning air. She pulled her coat tighter and walked slowly along the path.',
  'He had always believed that the best ideas came to him in the shower. Something about the warm water and the white noise of the spray helped his mind wander freely. Today was no different, and by the time he reached for the towel, he had a plan.',
  'The old library smelled of wood polish and paper, a scent that she had loved since childhood. She ran her fingers along the spines of the books as she walked between the shelves, searching for something she had not yet decided on.',
  'Every morning he made the same breakfast: two eggs scrambled, toast with butter, and a cup of black coffee. The routine was not exciting, but it gave him a sense of control before the unpredictable hours of the workday began.',
  'The train moved through the countryside at a steady pace, passing green fields, stone farmhouses, and the occasional cluster of trees. She watched the landscape scroll by and tried to remember the last time she had traveled somewhere just for the pleasure of it.',
  'There is a kind of courage required to admit that you were wrong. It is easier to double down, to find new arguments, to shift the terms of the debate. But the person who can say those three simple words earns something that cannot be taken away.',
  'The market was crowded by mid-morning, with vendors calling out prices and shoppers moving between the stalls. The smell of fresh bread mingled with that of roasting nuts and ripe fruit, and the sound of conversation rose and fell like a tide.',
  'She had lived in the city for ten years without ever visiting the botanical garden on the north side of the park. One rainy Tuesday she finally went, and she spent two hours there, moving slowly through the glass houses, forgetting the world outside.',
  'The instructions looked simple enough on paper, but after thirty minutes he had parts left over and the shelf was still wobbling. He sat back on his heels and stared at the diagram, certain that the problem was not with him but with whoever had drawn it.',
  'Learning to type well is one of those skills that pays dividends for decades. The time you invest in proper technique and speed is returned to you many times over in every email, document, and message you write for the rest of your life.',
]

function generatePrompt() {
  return PASSAGES[Math.floor(Math.random() * PASSAGES.length)]
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
  const typedRef = useRef('')
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
          endGame(typedRef.current, DURATION_S)
        }
      }, 200)
      setPhase('running')
    }

    typedRef.current = val
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
      description="Type the text below as fast and accurately as you can. 30 second timer starts on first keystroke."
    >
      {phase !== 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 960 }}>
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
