export function freeRollInitial() {
  return {
    streak: 0,
    bestStreak: 0,
    totalRolls: 0,
    lastResult: null,
    firstRoll: true,

    // Mode hook contract
    canRoll: true,
    canHold: false,
    canFinish: false,
    holdLabel: '',
    rollButtonLabel: 'Roll Dice',
    hint: 'Roll for lucky 7s, 11s, doubles, or snake eyes!',
    hud: { segments: [] },
    banner: null,
    celebration: null,
    gameOver: false,
    gameOverMessage: '',
  }
}

export function freeRollReducer(state, action) {
  switch (action.type) {
    case 'ROLL': {
      const { d1, d2 } = action
      const sum = d1 + d2
      const isSnakeEyes = d1 === 1 && d2 === 1
      const isDoubles = d1 === d2 && !isSnakeEyes
      const isSevenEleven = sum === 7 || sum === 11

      let result = null
      let celebration = null
      let banner = null

      if (isSnakeEyes) {
        result = 'snake-eyes'
        celebration = 'snake-eyes'
        banner = { text: 'SNAKE EYES!', type: 'snake-eyes' }
      } else if (isDoubles) {
        result = 'doubles'
        celebration = 'doubles'
        banner = { text: 'DOUBLES!', type: 'doubles' }
      } else if (isSevenEleven) {
        result = 'seven-eleven'
        celebration = 'seven-eleven'
        banner = { text: sum === 7 ? 'LUCKY 7!' : 'ELEVEN!', type: 'seven-eleven' }
      }

      const newStreak = result ? state.streak + 1 : 0
      const newBest = Math.max(state.bestStreak, newStreak)
      const newTotalRolls = state.totalRolls + 1

      return {
        ...state,
        streak: newStreak,
        bestStreak: newBest,
        totalRolls: newTotalRolls,
        lastResult: result,
        firstRoll: false,
        canFinish: true,
        celebration,
        banner,
        hint: result
          ? (newStreak > 1 ? `${newStreak}x streak! Keep it going!` : 'Nice! Roll again!')
          : 'Roll for lucky 7s, 11s, doubles, or snake eyes!',
        hud: {
          segments: newStreak > 1
            ? [{ type: 'streak', label: 'STREAK', value: newStreak, resultType: result }]
            : []
        },
      }
    }
    case 'FINISH': {
      const { bestStreak, totalRolls } = state
      const msg = bestStreak > 0
        ? `${totalRolls} rolls, best streak ${bestStreak}`
        : `${totalRolls} rolls, no lucky streaks`
      return {
        ...state,
        canRoll: false,
        canFinish: false,
        gameOver: true,
        gameOverMessage: msg,
        celebration: null,
        banner: null,
      }
    }
    case 'CLEAR_CELEBRATION':
      return { ...state, celebration: null, banner: null }
    case 'RESET':
      return freeRollInitial()
    default:
      return state
  }
}
