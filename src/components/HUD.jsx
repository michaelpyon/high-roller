import { useRef, useEffect } from 'react'

function AnimatedNumber({ value, className }) {
  const ref = useRef(null)
  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current && ref.current) {
      ref.current.classList.remove('hud-pop')
      void ref.current.offsetWidth
      ref.current.classList.add('hud-pop')
      prevValue.current = value
    }
  }, [value])

  return <span ref={ref} className={className}>{value}</span>
}

function ScoreSegment({ segment }) {
  const styleClass = segment.style === 'danger' ? 'hud-score-danger'
    : segment.style === 'warning' ? 'hud-score-warning'
    : segment.style === 'gold' ? 'hud-score-gold'
    : segment.style === 'muted' ? 'hud-score-muted'
    : 'hud-score-primary'

  return (
    <div className={`hud-segment hud-score ${styleClass}`}>
      <span className="hud-label">{segment.label}</span>
      <AnimatedNumber value={segment.value} className="hud-value" />
    </div>
  )
}

function ProgressSegment({ segment, accent }) {
  const pct = segment.max > 0 ? Math.min((segment.current / segment.max) * 100, 100) : 0
  return (
    <div className="hud-segment hud-progress">
      <span className="hud-label">{segment.label}</span>
      <div className="hud-progress-bar">
        <div
          className="hud-progress-fill"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>
    </div>
  )
}

function TargetSegment({ segment }) {
  return (
    <div className="hud-segment hud-target">
      <span className="hud-label">{segment.label}</span>
      <AnimatedNumber value={segment.value} className="hud-target-value" />
    </div>
  )
}

function RoundSegment({ segment }) {
  return (
    <div className="hud-segment hud-round">
      <span className="hud-label">{segment.label}</span>
      <span className="hud-value">{segment.current} / {segment.max}</span>
    </div>
  )
}

function TextSegment({ segment }) {
  return (
    <div className="hud-segment hud-text">
      <span className="hud-label">{segment.label}</span>
      <span className="hud-value">{segment.value}</span>
    </div>
  )
}

function StreakSegment({ segment }) {
  const typeClass = segment.resultType ? `mult-${segment.resultType}` : ''
  return (
    <div className={`multiplier ${typeClass}`}>
      <span className="mult-x">{segment.value}x</span>
      <span className="mult-label">STREAK</span>
    </div>
  )
}

function ChicagoStrip({ segment }) {
  return (
    <div className="hud-segment hud-chicago-strip">
      <div className="chicago-dots">
        {Array.from({ length: 11 }, (_, i) => {
          const result = segment.results[i]
          const isCurrent = i === segment.current - 1
          const className = result
            ? result.hit ? 'chicago-dot chicago-hit' : 'chicago-dot chicago-miss'
            : isCurrent ? 'chicago-dot chicago-current' : 'chicago-dot chicago-upcoming'
          return (
            <div key={i} className={className}>
              <span className="chicago-dot-label">{i + 2}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MexicoScore({ segment }) {
  const isBest = segment.style === 'best'
  return (
    <div className={`hud-segment hud-mexico-score ${isBest ? 'mexico-best' : ''}`}>
      <span className="hud-label">{segment.label}</span>
      <span className="hud-mexico-value">{segment.value}</span>
    </div>
  )
}

function MexicoGuide() {
  return (
    <div className="hud-segment hud-mexico-guide">
      <div className="mexico-guide-items">
        <span className="mexico-guide-item mexico-guide-top">🇲🇽 21 = Mexico</span>
        <span className="mexico-guide-item">66 &gt; 55 &gt; ... &gt; 11</span>
        <span className="mexico-guide-item">65 &gt; 64 &gt; ... &gt; 31</span>
      </div>
    </div>
  )
}

export default function HUD({ segments, accent }) {
  if (!segments || segments.length === 0) return null
  return (
    <div className="hud-panel">
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'score': return <ScoreSegment key={i} segment={seg} />
          case 'progress': return <ProgressSegment key={i} segment={seg} accent={accent} />
          case 'target': return <TargetSegment key={i} segment={seg} />
          case 'round': return <RoundSegment key={i} segment={seg} />
          case 'text': return <TextSegment key={i} segment={seg} />
          case 'streak': return <StreakSegment key={i} segment={seg} />
          case 'chicagoStrip': return <ChicagoStrip key={i} segment={seg} />
          case 'mexicoScore': return <MexicoScore key={i} segment={seg} />
          case 'mexicoGuide': return <MexicoGuide key={i} />
          default: return null
        }
      })}
    </div>
  )
}
