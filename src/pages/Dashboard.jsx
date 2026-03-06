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
    id: 'visual',
    path: '/visual',
    icon: '👁️',
    name: 'Visual Memory',
    desc: 'Remember an increasingly large board of highlighted squares.',
    unit: '',
    lowerBetter: false,
    label: 'score',
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
    id: 'typing',
    path: '/typing',
    icon: '⌨️',
    name: 'Typing Test',
    desc: 'How fast can you type? Measure your WPM and accuracy.',
    unit: 'WPM',
    lowerBetter: false,
  },
]

export default function Dashboard() {
  const { scores } = useScores()

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
    </div>
  )
}
