import { Link } from 'react-router-dom'

export default function ResultScreen({ score, unit, label, personalBest, isNewBest, onRetry }) {
  return (
    <div className="result-screen">
      <div>
        <div className="result-score">{score}</div>
        {unit && <div className="result-unit">{unit}</div>}
        {label && <div className="result-label">{label}</div>}
      </div>

      {isNewBest && (
        <div className="result-pb">New Personal Best!</div>
      )}

      {!isNewBest && personalBest !== null && personalBest !== undefined && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Personal best: <strong style={{ color: 'var(--text)' }}>{personalBest} {unit}</strong>
        </div>
      )}

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onRetry}>Try Again</button>
        <Link to="/" className="btn btn-secondary">Home</Link>
      </div>
    </div>
  )
}
