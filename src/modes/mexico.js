const STORAGE_KEY = 'high-roller-mexico-high'

function loadHighScore() {
  try { return parseInt(localStorage.getItem(STORAGE_KEY)) || 0 }
  catch { return 0 }
}

function saveHighScore(score) {
  try { localStorage.setItem(STORAGE_KEY, String(score)) }
  catch { /* ignore */ }
}

export function scoreMexicoRoll(d1, d2) {
  if ((d1 === 2 && d2 === 1) || (d1 === 1 && d2 === 2)) {
    return { value: 1000, label: 'MEXICO!', isMexico: true, isDoubles: false }
  }
  if (d1 === d2) {
    return { value: d1 * 100, label: `Double ${d1}s`, isMexico: false, isDoubles: true }
  }
  const high = Math.max(d1, d2)
  const low = Math.min(d1, d2)
  return { value: high * 10 + low, label: `${high}${low}`, isMexico: false, isDoubles: false }
}

export function mexicoInitial() {
  const highScore = loadHighScore()
  return {
    rollsThisRound: 0,
    bestScore: null,
    currentRoll: null,
    highScore,
    roundNumber: 1,
    firstRoll: true,

    canRoll: true,
    canHold: false,
    canFinish: false,
    holdLabel: '',
    rollButtonLabel: 'Roll Dice',
    hint: 'Higher die = tens digit. 3+5 = 53. Doubles beat non-doubles. 2+1 = MEXICO!',
    hud: {
      segments: [
        { type: 'text', label: 'Rolls Left', value: '3' },
        { type: 'score', label: 'High Score', value: highScore, style: 'muted' },
        { type: 'mexicoGuide' },
      ]
    },
    banner: null,
    celebration: null,
    gameOver: false,
    gameOverMessage: '',
  }
}

function buildMexicoHud(currentRoll, bestScore, rollsLeft, highScore) {
  const segments = []
  if (currentRoll) {
    segments.push({ type: 'mexicoScore', label: 'This Roll', value: currentRoll.label, score: currentRoll.value })
  }
  if (bestScore) {
    segments.push({ type: 'mexicoScore', label: 'Best This Round', value: bestScore.label, score: bestScore.value, style: 'best' })
  }
  segments.push({ type: 'text', label: 'Rolls Left', value: String(rollsLeft) })
  segments.push({ type: 'score', label: 'High Score', value: highScore, style: 'muted' })
  segments.push({ type: 'mexicoGuide' })
  return { segments }
}

export function mexicoReducer(state, action) {
  switch (action.type) {
    case 'ROLL': {
      const { d1, d2 } = action
      const roll = scoreMexicoRoll(d1, d2)
      const newRollCount = state.rollsThisRound + 1
      const newBest = (!state.bestScore || roll.value > state.bestScore.value) ? roll : state.bestScore
      const rollsLeft = 3 - newRollCount
      const isLastRoll = newRollCount >= 3

      if (isLastRoll) {
        // Round over -- finalize
        const finalScore = newBest.value
        const isNewHigh = finalScore > state.highScore
        const newHigh = isNewHigh ? finalScore : state.highScore
        if (isNewHigh) saveHighScore(newHigh)

        return {
          ...state,
          rollsThisRound: 0,
          bestScore: null,
          currentRoll: roll,
          highScore: newHigh,
          roundNumber: state.roundNumber + 1,
          firstRoll: false,
          canHold: false,
          canFinish: true,
          holdLabel: '',
          celebration: roll.isMexico ? 'jackpot' : isNewHigh ? 'high-score' : newBest.isDoubles ? 'doubles' : null,
          banner: roll.isMexico
            ? { text: 'MEXICO!', type: 'jackpot' }
            : isNewHigh
            ? { text: `NEW HIGH SCORE! ${newBest.label}`, type: 'high-score' }
            : { text: `Round over: ${newBest.label}`, type: 'neutral' },
          hint: isNewHigh
            ? `New record: ${newBest.label}! Go again or end the session!`
            : `Round over -- scored ${newBest.label}. Roll again or end the session!`,
          hud: buildMexicoHud(roll, null, 3, newHigh),
        }
      }

      // Not last roll
      return {
        ...state,
        rollsThisRound: newRollCount,
        bestScore: newBest,
        currentRoll: roll,
        firstRoll: false,
        canHold: true,
        canFinish: true,
        holdLabel: `Keep ${newBest.label}`,
        celebration: roll.isMexico ? 'jackpot' : null,
        banner: roll.isMexico
          ? { text: 'MEXICO!', type: 'jackpot' }
          : null,
        hint: roll.isMexico
          ? 'MEXICO! Auto-keeping the jackpot!'
          : rollsLeft === 1
          ? `Got ${roll.label}. Best: ${newBest.label}. Last roll or keep?`
          : `Got ${roll.label}. Best: ${newBest.label}. ${rollsLeft} rolls left.`,
        hud: buildMexicoHud(roll, newBest, rollsLeft, state.highScore),
      }
    }
    case 'HOLD': {
      // Keep current best, end round early
      const finalScore = state.bestScore ? state.bestScore.value : 0
      const isNewHigh = finalScore > state.highScore
      const newHigh = isNewHigh ? finalScore : state.highScore
      if (isNewHigh) saveHighScore(newHigh)

      return {
        ...state,
        rollsThisRound: 0,
        bestScore: null,
        currentRoll: null,
        highScore: newHigh,
        roundNumber: state.roundNumber + 1,
        canHold: false,
        canFinish: true,
        holdLabel: '',
        celebration: isNewHigh ? 'high-score' : null,
        banner: isNewHigh
          ? { text: `NEW HIGH SCORE! ${state.bestScore.label}`, type: 'high-score' }
          : { text: `Kept ${state.bestScore?.label}`, type: 'hold' },
        hint: isNewHigh
          ? `New record! Round ${state.roundNumber + 1} -- beat it!`
          : `Kept ${state.bestScore?.label}. Round ${state.roundNumber + 1}!`,
        hud: buildMexicoHud(null, null, 3, newHigh),
      }
    }
    case 'FINISH': {
      const { highScore, roundNumber } = state
      const rounds = roundNumber - 1
      const msg = rounds > 0
        ? `${rounds} round${rounds === 1 ? '' : 's'}, high score ${highScore}`
        : `High score ${highScore}`
      return {
        ...state,
        canRoll: false,
        canHold: false,
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
      return mexicoInitial()
    default:
      return state
  }
}
