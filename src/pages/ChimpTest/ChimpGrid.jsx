export default function ChimpGrid({ cells, numbersVisible, picked, onCellClick, cols }) {
  return (
    <div
      className="chimp-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 72px)` }}
    >
      {cells.map((cell, i) => {
        if (cell === null) {
          return <div key={i} className="chimp-cell" />
        }

        const isPickedCorrect = picked.includes(cell)

        let cls = 'chimp-cell'
        if (isPickedCorrect) {
          cls += ' correct-pick'
        } else if (numbersVisible) {
          cls += ' populated'
        } else {
          cls += ' hidden-populated'
        }

        return (
          <div key={i} className={cls} onClick={() => onCellClick(i, cell)}>
            {numbersVisible || isPickedCorrect ? cell : ''}
          </div>
        )
      })}
    </div>
  )
}
