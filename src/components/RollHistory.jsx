export default function RollHistory({ rolls }) {
  if (rolls.length === 0) return null
  return (
    <div className="history">
      <p className="history-title">History</p>
      <div className="history-rolls">
        {[...rolls].reverse().map((r, i) => (
          <div key={i} className={`history-item ${r.result ? `hist-${r.result}` : ''}`}>
            <span className="hist-dice">{r.d1} + {r.d2}</span>
            <span className="hist-sum">= {r.sum}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
