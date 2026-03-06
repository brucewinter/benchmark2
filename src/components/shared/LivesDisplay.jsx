export default function LivesDisplay({ lives, max = 3 }) {
  return (
    <div className="lives-display">
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < lives ? '❤️' : '🖤'}</span>
      ))}
    </div>
  )
}
