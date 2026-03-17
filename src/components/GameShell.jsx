import { useState, useCallback, useEffect, useRef } from 'react'
import Die from './Die'
import Particles from './Particles'
import HUD from './HUD'
import RollHistory from './RollHistory'
import { useGameMode } from '../modes/useGameMode'
import { getModeById } from '../modes/modeRegistry'

function TargetSelector({ onSelect }) {
  return (
    <div className="target-selector">
      <p className="target-prompt">Pick your target</p>
      <div className="target-buttons">
        {[50, 100, 150].map(t => (
          <button key={t} className="target-btn" onClick={() => onSelect(t)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

function GameOverOverlay({ message, onPlayAgain, onChangeMode }) {
  return (
    <div className="game-over-overlay">
      <div className="game-over-card">
        <p className="game-over-message">{message}</p>
        <div className="game-over-buttons">
          <button className="roll-btn game-over-btn" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="roll-btn game-over-btn game-over-btn-secondary" onClick={onChangeMode}>
            Change Mode
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GameShell({ modeId, onChangeMode }) {
  const [die1, setDie1] = useState(1)
  const [die2, setDie2] = useState(2)
  const [rolling, setRolling] = useState(false)
  const [die1Settled, setDie1Settled] = useState(false)
  const [die2Settled, setDie2Settled] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationType, setCelebrationType] = useState(null)
  const [rollHistory, setRollHistory] = useState([])
  const [screenShake, setScreenShake] = useState(false)
  const timeoutRef = useRef(null)
  const celebrationTimeoutRef = useRef(null)

  const mode = useGameMode(modeId)
  const modeInfo = getModeById(modeId)

  const roll = useCallback(() => {
    if (rolling || !mode.canRoll || mode.gameOver) return
    setRolling(true)
    setDie1Settled(false)
    setDie2Settled(false)
    setShowCelebration(false)
    setCelebrationType(null)
    setScreenShake(false)

    // Realistic staggered dice timing
    const die1Ticks = 8 + Math.floor(Math.random() * 7) // 8-14
    const die2Ticks = 8 + Math.floor(Math.random() * 7)
    const baseInterval = 50
    let tick1 = 0
    let tick2 = 0
    let finalD1 = null
    let finalD2 = null

    const d1Final = Math.ceil(Math.random() * 6)
    const d2Final = Math.ceil(Math.random() * 6)

    // Die 1 animation with deceleration
    const animateDie1 = () => {
      if (tick1 >= die1Ticks) {
        finalD1 = d1Final
        setDie1(d1Final)
        setDie1Settled(true)
        checkBothDone()
        return
      }
      setDie1(Math.ceil(Math.random() * 6))
      tick1++
      // Decelerate: intervals get longer toward the end
      const progress = tick1 / die1Ticks
      const delay = baseInterval + progress * progress * 80
      setTimeout(animateDie1, delay)
    }

    // Die 2 animation with deceleration
    const animateDie2 = () => {
      if (tick2 >= die2Ticks) {
        finalD2 = d2Final
        setDie2(d2Final)
        setDie2Settled(true)
        checkBothDone()
        return
      }
      setDie2(Math.ceil(Math.random() * 6))
      tick2++
      const progress = tick2 / die2Ticks
      const delay = baseInterval + progress * progress * 80
      setTimeout(animateDie2, delay)
    }

    const doneCount = { value: 0 }
    const checkBothDone = () => {
      doneCount.value++
      if (doneCount.value >= 2) {
        // Both settled
        setRolling(false)
        mode.onRollComplete(d1Final, d2Final)
        setRollHistory(prev => [...prev.slice(-19), { d1: d1Final, d2: d2Final, sum: d1Final + d2Final, result: null }])
      }
    }

    // Start both with a slight random offset
    setTimeout(animateDie1, 0)
    setTimeout(animateDie2, Math.random() * 60)
  }, [rolling, mode])

  // Watch for celebration triggers from mode
  useEffect(() => {
    if (mode.celebration) {
      setCelebrationType(mode.celebration)
      setShowCelebration(true)
      if (mode.celebration === 'bust' || mode.celebration === 'danger') {
        setScreenShake(true)
        setTimeout(() => setScreenShake(false), 400)
      }
      if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current)
      celebrationTimeoutRef.current = setTimeout(() => {
        setShowCelebration(false)
        mode.onRollComplete && null // celebration auto-clears visually
      }, 2500)
    }
  }, [mode.celebration])

  // Update roll history with mode results
  useEffect(() => {
    if (mode.banner && rollHistory.length > 0) {
      setRollHistory(prev => {
        const updated = [...prev]
        if (updated.length > 0) {
          updated[updated.length - 1] = { ...updated[updated.length - 1], result: mode.banner.type }
        }
        return updated
      })
    }
  }, [mode.banner])

  // Keyboard handler
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        if (mode.gameOver) return
        roll()
      }
      if ((e.key === 'h' || e.key === 'H') && mode.canHold) {
        e.preventDefault()
        mode.onHold()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [roll, mode.canHold, mode.onHold, mode.gameOver])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current)
    }
  }, [])

  const handlePlayAgain = () => {
    mode.onReset()
    setRollHistory([])
    setShowCelebration(false)
    setCelebrationType(null)
    setDie1(1)
    setDie2(2)
  }

  const celebrationClass = showCelebration && celebrationType ? `celebration-${celebrationType}` : ''

  return (
    <div className={`app ${celebrationClass} ${screenShake ? 'screen-shake' : ''}`}>
      <div className={`glow-overlay ${showCelebration && celebrationType ? `glow-${celebrationType}` : ''}`} />
      {showCelebration && celebrationType && <Particles type={celebrationType} />}

      <div className="container game-container">
        <div className="game-top-bar">
          <button className="back-btn" onClick={onChangeMode}>
            ← Modes
          </button>
          <h1 className="game-title">{modeInfo.name}</h1>
        </div>

        <HUD segments={mode.hud.segments} accent={modeInfo.accent} />

        {modeId === 'race-to-target' && mode.target === null && (
          <TargetSelector onSelect={mode.onSetTarget} />
        )}

        <p className="game-hint">{mode.hint}</p>

        <div className="dice-area">
          <Die value={die1} rolling={rolling && !die1Settled} settled={die1Settled && rolling} />
          <Die value={die2} rolling={rolling && !die2Settled} settled={die2Settled && rolling} />
        </div>

        <div className="sum-display">
          {!rolling && <span className="sum-value">{die1 + die2}</span>}
        </div>

        {showCelebration && mode.banner && (
          <div className={`result-banner banner-${mode.banner.type}`}>
            {mode.banner.text}
          </div>
        )}

        <div className="button-area">
          <button
            className="roll-btn"
            onClick={roll}
            disabled={rolling || !mode.canRoll || mode.gameOver}
          >
            {rolling ? 'Rolling...' : mode.rollButtonLabel}
          </button>

          {mode.canHold && (
            <button
              className="roll-btn hold-btn"
              onClick={mode.onHold}
              disabled={rolling}
            >
              {mode.holdLabel}
            </button>
          )}
        </div>

        <p className="hint">
          {mode.canHold ? 'Space to roll · H to hold' : 'Press Space or Enter to roll'}
        </p>

        {modeId === 'free-roll' && <RollHistory rolls={rollHistory} />}

        {mode.gameOver && (
          <GameOverOverlay
            message={mode.gameOverMessage}
            onPlayAgain={handlePlayAgain}
            onChangeMode={onChangeMode}
          />
        )}
      </div>
    </div>
  )
}
