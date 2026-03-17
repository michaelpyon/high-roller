const STORAGE_KEY = 'high-roller-sevens-out-high'

function loadHighScore() {
  try { return parseInt(localStorage.getItem(STORAGE_KEY)) || 0 }
  catch { return 0 }
}

function saveHighScore(score) {
  try { localStorage.setItem(STORAGE_KEY, String(score)) }
  catch { /* ignore */ }
}

export function sevensOutInitial() {
  const highScore = loadHighScore()
  return {
    currentScore: 0,
    highScore,
    roundNumber: 1,
    firstRoll: true,

    canRoll: true,
    canHold: false,
    holdLabel: '',
    rollButtonLabel: 'Roll Dice',
    hint: 'Roll and add points. Bank to save. Roll a 7 = game over!',
    hud: {
      segments: [
        { type: 'score', label: 'Score', value: 0, style: 'primary' },
        { type: 'score', label: 'High Score', value: highScore, style: 'muted' },
      ]
    },
    banner: null,
    celebration: null,
    gameOver: false,
    gameOverMessage: '',
  }
}

export function sevensOutReducer(state, action) {
  switch (action.type) {
    case 'ROLL': {
      const { d1, d2 } = action
      const sum = d1 + d2

      if (sum === 7) {
        // BUSTED
        const lost = state.currentScore
        const isNewHigh = lost > state.highScore && lost > 0
        return {
          ...state,
          currentScore: 0,
          firstRoll: false,
          canRoll: false,
          canHold: false,
          holdLabel: '',
          celebration: 'bust',
          banner: { text: `SEVENS OUT! Lost ${lost}!`, type: 'bust' },
          gameOver: true,
          gameOverMessage: lost > 0 ? `Rolled a 7! Lost ${lost} points.` : 'Rolled a 7 on the first roll!',
          hint: isNewHigh ? 'So close to a new high score...' : 'The 7 strikes again!',
          hud: {
            segments: [
              { type: 'score', label: 'Lost', value: lost, style: 'danger' },
              { type: 'score', label: 'High Score', value: state.highScore, style: 'muted' },
            ]
          },
        }
      }

      // Good roll
      const newScore = state.currentScore + sum
      return {
        ...state,
        currentScore: newScore,
        firstRoll: false,
        canHold: newScore > 0,
        holdLabel: `Bank ${newScore}`,
        celebration: null,
        banner: null,
        hint: newScore > state.highScore && state.highScore > 0
          ? `${newScore} — beating your high score! Bank it?`
          : newScore > 40
          ? `${newScore} on the line... feeling lucky?`
          : `+${sum}! Keep rolling or bank ${newScore}?`,
        hud: {
          segments: [
            { type: 'score', label: 'Score', value: newScore, style: newScore > 40 ? 'warning' : 'primary' },
            { type: 'score', label: 'High Score', value: state.highScore, style: 'muted' },
          ]
        },
      }
    }
    case 'HOLD': {
      const banked = state.currentScore
      const isNewHigh = banked > state.highScore
      const newHigh = isNewHigh ? banked : state.highScore
      if (isNewHigh) saveHighScore(newHigh)

      return {
        ...state,
        currentScore: 0,
        highScore: newHigh,
        roundNumber: state.roundNumber + 1,
        canHold: false,
        holdLabel: '',
        celebration: isNewHigh ? 'high-score' : null,
        banner: isNewHigh
          ? { text: `NEW HIGH SCORE! ${banked}!`, type: 'high-score' }
          : { text: `Banked ${banked}!`, type: 'hold' },
        hint: isNewHigh
          ? `🏆 New record: ${banked}! Can you beat it?`
          : `Banked ${banked}. Round ${state.roundNumber + 1} — go again!`,
        hud: {
          segments: [
            { type: 'score', label: 'Score', value: 0, style: 'primary' },
            { type: 'score', label: 'High Score', value: newHigh, style: isNewHigh ? 'gold' : 'muted' },
          ]
        },
      }
    }
    case 'CLEAR_CELEBRATION':
      return { ...state, celebration: null, banner: null }
    case 'RESET':
      return sevensOutInitial()
    default:
      return state
  }
}
