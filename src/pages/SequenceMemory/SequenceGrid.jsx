export default function SequenceGrid({ flashIndex, onTileClick, phase, wrongIndex }) {
  return (
    <div className="seq-grid">
      {Array.from({ length: 9 }, (_, i) => {
        let cls = 'seq-tile'
        if (flashIndex === i) cls += ' flash'
        else if (phase === 'gameover' && wrongIndex === i) cls += ' wrong'
        return (
          <button
            key={i}
            className={cls}
            onClick={() => onTileClick(i)}
            disabled={phase !== 'input'}
          />
        )
      })}
    </div>
  )
}
