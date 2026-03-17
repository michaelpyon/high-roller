import { useState, useCallback } from 'react'
import ModeSelector from './components/ModeSelector'
import GameShell from './components/GameShell'

export default function App() {
  const [screen, setScreen] = useState('select')
  const [selectedMode, setSelectedMode] = useState(null)
  const [exiting, setExiting] = useState(false)

  const handleModeSelect = useCallback((modeId) => {
    setExiting(true)
    setTimeout(() => {
      setSelectedMode(modeId)
      setScreen('play')
      setExiting(false)
    }, 300)
  }, [])

  const handleChangeMode = useCallback(() => {
    setScreen('select')
    setSelectedMode(null)
  }, [])

  return (
    <>
      {screen === 'select' && (
        <ModeSelector onSelect={handleModeSelect} exiting={exiting} />
      )}
      {screen === 'play' && selectedMode && (
        <GameShell key={selectedMode} modeId={selectedMode} onChangeMode={handleChangeMode} />
      )}
    </>
  )
}
