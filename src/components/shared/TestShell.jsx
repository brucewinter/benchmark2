import { Link } from 'react-router-dom'

export default function TestShell({ title, description, children }) {
  return (
    <div className="test-shell">
      <Link to="/" className="test-shell-back">← Dashboard</Link>
      <h1 className="test-title">{title}</h1>
      {description && <p className="test-description">{description}</p>}
      {children}
    </div>
  )
}
