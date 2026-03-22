export default function ChimpGrid({ cells, numbersVisible, picked, onCellClick, cols }) {
  return (
    <div
      className="chimp-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 72px)` }}
    >
      {cells.map((cell, i) => {
        const isPickedCorrect = picked.includes(cell)

        // During show phase: only numbered tiles are visible; empty slots are invisible placeholders
        if (numbersVisible) {
          if (cell === null) {
            return <div key={i} className="chimp-cell chimp-cell--ghost" />
          }
          return (
            <div key={i} className="chimp-cell populated" onClick={() => onCellClick(i, cell)}>
              {cell}
            </div>
          )
        }

        // During guess phase: correctly-picked tiles disappear; everything else is a blank blue tile
        if (isPickedCorrect) {
          return <div key={i} className="chimp-cell chimp-cell--ghost" />
        }

        const cls = cell !== null ? 'chimp-cell hidden-populated' : 'chimp-cell hidden-empty'
        return (
          <div key={i} className={cls} onClick={() => onCellClick(i, cell)} />
        )
      })}
    </div>
  )
}
