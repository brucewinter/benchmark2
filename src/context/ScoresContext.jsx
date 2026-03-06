import { createContext, useContext, useState } from 'react'
import { loadScores, saveScores, isBetter } from '../lib/storage'
import { loadHistory, saveHistory, addHistoryEntry } from '../lib/history'

const ScoresContext = createContext(null)

export function ScoresProvider({ children }) {
  const [scores, setScores] = useState(() => loadScores())
  const [history, setHistory] = useState(() => loadHistory())

  function updateScore(testId, newVal) {
    // Always record to history
    setHistory(prev => {
      const next = addHistoryEntry(prev, testId, newVal)
      saveHistory(next)
      return next
    })
    // Update best if better
    setScores(prev => {
      const current = prev[testId]?.best
      if (!isBetter(testId, newVal, current)) return prev
      const next = { ...prev, [testId]: { best: newVal } }
      saveScores(next)
      return next
    })
  }

  return (
    <ScoresContext.Provider value={{ scores, updateScore, history }}>
      {children}
    </ScoresContext.Provider>
  )
}

export function useScores() {
  const ctx = useContext(ScoresContext)
  if (!ctx) throw new Error('useScores must be used within ScoresProvider')
  return ctx
}
