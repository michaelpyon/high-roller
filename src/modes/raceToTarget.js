export function raceToTargetInitial() {
  return {
    target: null, // null = not yet selected
    runningTotal: 0,
    rollCount: 0,
    firstRoll: true,

    canRoll: false, // can't roll until target is selected
    canHold: false,
    holdLabel: '',
    rollButtonLabel: 'Roll Dice',
    hint: 'Pick a target to start!',
    hud: { segments: [] },
    banner: null,
    celebration: null,
    gameOver: false,
    gameOverMessage: '',
  }
}

export function raceToTargetReducer(state, action) {
  switch (action.type) {
    case 'SET_TARGET': {
      const target = action.target
      return {
        ...state,
        target,
        canRoll: true,
        hint: `Roll to reach ${target}!`,
        hud: {
          segments: [
            { type: 'progress', label: `Target: ${target}`, current: 0, max: target },
            { type: 'score', label: 'Total', value: 0 },
            { type: 'text', label: 'Rolls', value: '0' },
          ]
        },
      }
    }
    case 'ROLL': {
      const { d1, d2 } = action
      const sum = d1 + d2
      const newTotal = state.runningTotal + sum
      const newRollCount = state.rollCount + 1
      const hitTarget = newTotal >= state.target

      return {
        ...state,
        runningTotal: newTotal,
        rollCount: newRollCount,
        firstRoll: false,
        canRoll: !hitTarget,
        celebration: hitTarget ? 'victory' : null,
        banner: hitTarget ? { text: 'TARGET HIT!', type: 'victory' } : null,
        gameOver: hitTarget,
        gameOverMessage: hitTarget ? `You hit ${state.target} in ${newRollCount} rolls!` : '',
        hint: hitTarget
          ? `🎯 ${newTotal} in ${newRollCount} rolls!`
          : `${state.target - newTotal} more to go!`,
        hud: {
          segments: [
            { type: 'progress', label: `Target: ${state.target}`, current: Math.min(newTotal, state.target), max: state.target },
            { type: 'score', label: 'Total', value: newTotal },
            { type: 'text', label: 'Rolls', value: String(newRollCount) },
          ]
        },
      }
    }
    case 'CLEAR_CELEBRATION':
      return { ...state, celebration: null, banner: null }
    case 'RESET':
      return raceToTargetInitial()
    default:
      return state
  }
}
