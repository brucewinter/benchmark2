import { createContext, useContext, useState } from 'react'
import { loadScores, saveScores, isBetter } from '../lib/storage'

const ScoresContext = createContext(null)

export function ScoresProvider({ children }) {
  const [scores, setScores] = useState(() => loadScores())

  function updateScore(testId, newVal) {
    setScores(prev => {
      const current = prev[testId]?.best
      if (!isBetter(testId, newVal, current)) return prev
      const next = { ...prev, [testId]: { best: newVal } }
      saveScores(next)
      return next
    })
  }

  return (
    <ScoresContext.Provider value={{ scores, updateScore }}>
      {children}
    </ScoresContext.Provider>
  )
}

export function useScores() {
  const ctx = useContext(ScoresContext)
  if (!ctx) throw new Error('useScores must be used within ScoresProvider')
  return ctx
}
