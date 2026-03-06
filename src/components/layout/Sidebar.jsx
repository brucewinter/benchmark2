import { NavLink } from 'react-router-dom'
import { useScores } from '../../context/ScoresContext'

const TESTS = [
  { id: 'reaction', path: '/reaction', label: 'Reaction Time', unit: 'ms', lowerBetter: true },
  { id: 'sequence', path: '/sequence', label: 'Sequence Memory', unit: '' },
  { id: 'number',   path: '/number',   label: 'Number Memory', unit: '' },
  { id: 'aim',      path: '/aim',      label: 'Aim Trainer', unit: 'ms', lowerBetter: true },
  { id: 'visual',   path: '/visual',   label: 'Visual Memory', unit: '' },
  { id: 'chimp',    path: '/chimp',    label: 'Chimp Test', unit: '' },
  { id: 'verbal',   path: '/verbal',   label: 'Verbal Memory', unit: '' },
  { id: 'typing',   path: '/typing',   label: 'Typing Test', unit: 'WPM' },
]

export default function Sidebar() {
  const { scores } = useScores()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Human Benchmark</div>
        <div className="sidebar-subtitle">Cognitive Tests</div>
      </div>
      <nav className="sidebar-nav">
        {TESTS.map(t => {
          const best = scores[t.id]?.best
          return (
            <NavLink
              key={t.id}
              to={t.path}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
            >
              <span>{t.label}</span>
              {best !== null && best !== undefined && (
                <span className="link-score">{best}{t.unit}</span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
