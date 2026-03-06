export default function TypingDisplay({ prompt, typed, cursorPos }) {
  return (
    <div className="typing-prompt">
      {prompt.split('').map((ch, i) => {
        let cls = 'char-untyped'
        if (i < typed.length) {
          cls = typed[i] === ch ? 'char-correct' : 'char-wrong'
        }
        const isCursor = i === cursorPos
        return (
          <span key={i} className={`${cls}${isCursor ? ' char-cursor' : ''}`}>
            {ch}
          </span>
        )
      })}
    </div>
  )
}
