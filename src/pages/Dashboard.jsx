import { Link } from 'react-router-dom'
import { useScores } from '../context/ScoresContext'

const TESTS = [
  {
    id: 'reaction',
    path: '/reaction',
    icon: '⚡',
    name: 'Reaction Time',
    desc: 'Test your visual reflexes. Click when the screen turns green.',
    unit: 'ms',
    lowerBetter: true,
  },
  {
    id: 'aim',
    path: '/aim',
    icon: '🎯',
    name: 'Aim Trainer',
    desc: 'Click 30 targets as fast as possible.',
    unit: 'ms',
    lowerBetter: true,
    label: '/target',
  },
  {
    id: 'chimp',
    path: '/chimp',
    icon: '🐒',
    name: 'Chimp Test',
    desc: 'Click numbered squares in order after they disappear.',
    unit: '',
    lowerBetter: false,
    label: 'level',
  },
  {
    id: 'typing',
    path: '/typing',
    icon: '⌨️',
    name: 'Typing Test',
    desc: 'How fast can you type? Measure your WPM and accuracy.',
    unit: 'WPM',
    lowerBetter: false,
  },
  {
    id: 'number',
    path: '/number',
    icon: '🔡',
    name: 'Number Memory',
    desc: 'Memorize an increasingly long sequence of numbers.',
    unit: '',
    lowerBetter: false,
    label: 'level',
  },
  {
    id: 'verbal',
    path: '/verbal',
    icon: '📝',
    name: 'Verbal Memory',
    desc: 'Keep track of which words you have seen before.',
    unit: '',
    lowerBetter: false,
    label: 'score',
  },
  {
    id: 'sequence',
    path: '/sequence',
    icon: '🔢',
    name: 'Sequence Memory',
    desc: 'Remember an increasingly long pattern of button presses.',
    unit: '',
    lowerBetter: false,
    label: 'level',
  },
  {
    id: 'visual',
    path: '/visual',
    icon: '👁️',
    name: 'Visual Memory',
    desc: 'Remember an increasingly large board of highlighted squares.',
    unit: '',
    lowerBetter: false,
    label: 'score',
  },
]

function Sparkline({ entries, lowerBetter }) {
  if (entries.length < 2) return null
  const values = entries.map(e => e.score)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return (
    <div className="sparkline">
      {entries.map((e, i) => {
        const norm = (e.score - min) / range
        const heightPct = Math.max(lowerBetter ? (1 - norm) * 100 : norm * 100, 8)
        return (
          <div
            key={i}
            className="spark-bar"
            style={{ height: `${heightPct}%` }}
            title={`${e.score}`}
          />
        )
      })}
    </div>
  )
}

function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const { scores, history } = useScores()

  const testsWithHistory = TESTS.filter(t => history[t.id]?.length > 0)

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <h1>Human Benchmark</h1>
        <p>Test your cognitive abilities with these 8 challenges.</p>
      </div>

      <div className="tests-grid">
        {TESTS.map(t => {
          const best = scores[t.id]?.best
          return (
            <Link key={t.id} to={t.path} className="test-card">
              <div className="test-card-icon">{t.icon}</div>
              <div className="test-card-name">{t.name}</div>
              <div className="test-card-desc">{t.desc}</div>
              <div className="test-card-score">
                {best !== null && best !== undefined
                  ? <>Best: <span>{best}{t.unit}{t.label ? ' ' + t.label : ''}</span></>
                  : 'Not attempted'}
              </div>
            </Link>
          )
        })}
      </div>

      {testsWithHistory.length > 0 && (
        <div className="history-section">
          <h2 className="history-heading">Recent History</h2>
          <div className="history-list">
            {testsWithHistory.map(t => {
              const entries = history[t.id]
              const recent = entries.slice(-20)
              const last = entries[entries.length - 1]
              return (
                <div key={t.id} className="history-row">
                  <div className="history-row-meta">
                    <span className="history-row-icon">{t.icon}</span>
                    <div>
                      <div className="history-row-name">{t.name}</div>
                      <div className="history-row-last">
                        Latest: <strong>{last.score}{t.unit}{t.label ? ' ' + t.label : ''}</strong>
                        <span className="history-row-date">{formatDate(last.ts)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="history-row-chart">
                    <Sparkline entries={recent} lowerBetter={t.lowerBetter} />
                    <div className="history-row-runs">{entries.length} run{entries.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
