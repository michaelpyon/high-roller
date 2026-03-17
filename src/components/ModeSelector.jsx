import { MODES } from '../modes/modeRegistry'

export default function ModeSelector({ onSelect, exiting }) {
  return (
    <div className={`mode-selector ${exiting ? 'mode-selector-exit' : 'mode-selector-enter'}`}>
      <div className="mode-selector-header">
        <h1 className="mode-selector-title">HIGH ROLLER</h1>
        <p className="mode-selector-subtitle">Choose Your Game</p>
      </div>
      <div className="mode-grid">
        {MODES.map((mode, i) => (
          <button
            key={mode.id}
            className="mode-card"
            style={{
              '--mode-accent': mode.accent,
              '--card-delay': `${i * 0.05}s`,
            }}
            onClick={() => onSelect(mode.id)}
          >
            <span className="mode-card-icon">{mode.icon}</span>
            <span className="mode-card-name">{mode.name}</span>
            <span className="mode-card-desc">{mode.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
