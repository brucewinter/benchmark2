import { useState, useRef, useCallback } from 'react'

export function useTimer(initialMs = 0) {
  const [elapsed, setElapsed] = useState(initialMs)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  const start = useCallback(() => {
    startTimeRef.current = performance.now() - elapsed
    intervalRef.current = setInterval(() => {
      setElapsed(performance.now() - startTimeRef.current)
    }, 50)
  }, [elapsed])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setElapsed(0)
    startTimeRef.current = null
  }, [stop])

  return { elapsed, start, stop, reset }
}
