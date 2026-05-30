import { useReducer, useCallback } from 'react'
import { getModeById } from './modeRegistry'

export function useGameMode(modeId) {
  const mode = getModeById(modeId)
  const [state, dispatch] = useReducer(mode.reducer, mode.initial())

  const onRollComplete = useCallback((d1, d2) => {
    dispatch({ type: 'ROLL', d1, d2 })
  }, [])

  const onHold = useCallback(() => {
    dispatch({ type: 'HOLD' })
  }, [])

  const onReset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const onSetTarget = useCallback((target) => {
    dispatch({ type: 'SET_TARGET', target })
  }, [])

  const onFinish = useCallback(() => {
    dispatch({ type: 'FINISH' })
  }, [])

  return {
    ...state,
    onRollComplete,
    onHold,
    onReset,
    onSetTarget,
    onFinish,
    modeAccent: mode.accent,
  }
}
