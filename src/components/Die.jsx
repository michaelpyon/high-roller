const DOT_POSITIONS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

export default function Die({ value, rolling, settled }) {
  const dots = DOT_POSITIONS[value] || []
  return (
    <div className={`die ${rolling ? 'rolling' : ''} ${settled ? 'die-settled' : ''}`}>
      {dots.map(([x, y], i) => (
        <div
          key={i}
          className="dot"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  )
}
