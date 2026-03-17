export default function Particles({ type }) {
  const count = type === 'snake-eyes' || type === 'victory' || type === 'jackpot' ? 40 : type === 'bust' ? 20 : type === 'danger' ? 10 : type === 'high-score' ? 30 : 20
  return (
    <div className="particles">
      {Array.from({ length: count }, (_, i) => {
        const angle = (360 / count) * i
        const distance = 80 + Math.random() * 120
        const size = (type === 'snake-eyes' || type === 'jackpot') ? 4 + Math.random() * 6 : 3 + Math.random() * 4
        const dx = Math.cos((angle * Math.PI) / 180) * distance
        const dy = Math.sin((angle * Math.PI) / 180) * distance
        return (
          <div
            key={i}
            className={`particle particle-${type}`}
            style={{
              '--dx': `${dx}px`,
              '--dy': `${dy}px`,
              '--size': `${size}px`,
              '--delay': `${Math.random() * 0.15}s`,
            }}
          />
        )
      })}
    </div>
  )
}
