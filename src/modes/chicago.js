export function chicagoInitial() {
  return {
    currentRound: 1, // 1-11, target = round + 1
    score: 0,
    results: [], // { target, hit }
    firstRoll: true,
    waitingForNext: false,

    canRoll: true,
    canHold: false,
    holdLabel: '',
    rollButtonLabel: 'Roll for 2',
    hint: 'Roll a 2! That\'s the target for round 1. You get 11 rounds, targets 2 through 12.',
    hud: {
      segments: [
        { type: 'target', label: 'Target Sum', value: 2 },
        { type: 'round', label: 'Round', current: 1, max: 11 },
        { type: 'chicagoStrip', results: [], current: 1 },
      ]
    },
    banner: null,
    celebration: null,
    gameOver: false,
    gameOverMessage: '',
  }
}

function buildChicagoHud(round, score, results) {
  const target = round + 1
  return {
    segments: [
      { type: 'target', label: 'Target Sum', value: target },
      { type: 'round', label: 'Round', current: round, max: 11 },
      { type: 'score', label: 'Score', value: `${score} / 11`, style: 'primary' },
      { type: 'chicagoStrip', results, current: round },
    ]
  }
}

export function chicagoReducer(state, action) {
  switch (action.type) {
    case 'ROLL': {
      if (state.waitingForNext) return state

      const { d1, d2 } = action
      const sum = d1 + d2
      const target = state.currentRound + 1
      const hit = sum === target
      const newScore = hit ? state.score + 1 : state.score
      const newResults = [...state.results, { target, hit }]
      const newRound = state.currentRound + 1
      const isLastRound = state.currentRound >= 11

      if (isLastRound) {
        const isPerfect = newScore === 11
        return {
          ...state,
          score: newScore,
          results: newResults,
          firstRoll: false,
          canRoll: false,
          waitingForNext: false,
          celebration: isPerfect ? 'jackpot' : newScore >= 6 ? 'victory' : null,
          banner: isPerfect
            ? { text: 'PERFECT GAME!', type: 'jackpot' }
            : hit
            ? { text: `HIT! Final score: ${newScore}/11`, type: 'victory' }
            : { text: `Miss. Final score: ${newScore}/11`, type: 'neutral' },
          gameOver: true,
          gameOverMessage: isPerfect
            ? `Perfect 11/11! Incredible!`
            : `Final score: ${newScore}/11`,
          hint: isPerfect ? '🏆 Flawless!' : newScore >= 8 ? 'Great game!' : newScore >= 5 ? 'Not bad!' : 'Better luck next time!',
          hud: { segments: [
            { type: 'score', label: 'Final Score', value: `${newScore} / 11`, style: 'primary' },
            { type: 'chicagoStrip', results: newResults, current: 12 },
          ]},
        }
      }

      // Not the last round
      const nextTarget = newRound + 1
      return {
        ...state,
        currentRound: newRound,
        score: newScore,
        results: newResults,
        firstRoll: false,
        waitingForNext: false,
        rollButtonLabel: `Roll for ${nextTarget}`,
        celebration: hit ? 'seven-eleven' : null,
        banner: hit
          ? { text: `HIT! +1`, type: 'seven-eleven' }
          : { text: `Miss — needed ${target}, got ${sum}`, type: 'neutral' },
        hint: hit
          ? `Nice! Now roll for ${nextTarget}!`
          : `Needed ${target}, got ${sum}. Now roll for ${nextTarget}!`,
        hud: buildChicagoHud(newRound, newScore, newResults),
      }
    }
    case 'CLEAR_CELEBRATION':
      return { ...state, celebration: null, banner: null }
    case 'RESET':
      return chicagoInitial()
    default:
      return state
  }
}
