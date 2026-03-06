export default function VisualGrid({ size, highlighted, picked, phase, onTileClick }) {
  return (
    <div
      className="vis-grid"
      style={{ gridTemplateColumns: `repeat(${size}, 80px)` }}
    >
      {Array.from({ length: size * size }, (_, i) => {
        let cls = 'vis-tile'
        if (phase === 'showing' && highlighted.has(i)) {
          cls += ' highlighted'
        } else if (phase === 'input' || phase === 'gameover') {
          if (picked.get(i) === true) cls += ' picked-correct'
          else if (picked.get(i) === false) cls += ' picked-wrong'
        }
        return (
          <div
            key={i}
            className={cls}
            onClick={() => onTileClick(i)}
          />
        )
      })}
    </div>
  )
}
