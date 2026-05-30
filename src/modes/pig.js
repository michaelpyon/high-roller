export function pigInitial() {
  return {
    bankedScore: 0,
    turnTotal: 0,
    bustType: null, // 'single-one' | 'snake-eyes' | null
    firstRoll: true,

    canRoll: true,
    canHold: false,
    canFinish: false,
    holdLabel: '',
    rollButtonLabel: 'Roll Dice',
    hint: 'Roll to build points. Hold to bank them safely. Roll a 1 and you lose your turn!',
    hud: buildPigHud(0, 0),
    banner: null,
    celebration: null,
    gameOver: false,
    gameOverMessage: '',
  }
}

function buildPigHud(banked, turnTotal) {
  return {
    segments: [
      { type: 'score', label: 'Banked', value: banked, style: 'primary' },
      { type: 'score', label: 'At Risk', value: turnTotal, style: turnTotal > 30 ? 'danger' : turnTotal > 15 ? 'warning' : 'default' },
      { type: 'progress', label: 'Goal: 100', current: Math.min(banked, 100), max: 100 },
    ]
  }
}

export function pigReducer(state, action) {
  switch (action.type) {
    case 'ROLL': {
      const { d1, d2 } = action
      const isSnakeEyes = d1 === 1 && d2 === 1
      const hasOne = d1 === 1 || d2 === 1

      if (isSnakeEyes) {
        // Lose EVERYTHING
        return {
          ...state,
          bankedScore: 0,
          turnTotal: 0,
          bustType: 'snake-eyes',
          firstRoll: false,
          canHold: false,
          holdLabel: '',
          celebration: 'bust',
          banner: { text: 'SNAKE EYES! LOST EVERYTHING!', type: 'bust' },
          hint: 'Devastating! All your banked points are gone. Roll to start over.',
          hud: buildPigHud(0, 0),
        }
      }

      if (hasOne) {
        // Lose turn total only
        const lost = state.turnTotal
        return {
          ...state,
          turnTotal: 0,
          bustType: 'single-one',
          firstRoll: false,
          canHold: false,
          holdLabel: '',
          celebration: 'danger',
          banner: { text: `BUSTED! Lost ${lost} points`, type: 'danger' },
          hint: `Rolled a 1! Lost ${lost} turn points. Roll to try again.`,
          hud: buildPigHud(state.bankedScore, 0),
        }
      }

      // Good roll
      const sum = d1 + d2
      const newTurnTotal = state.turnTotal + sum
      const wouldWin = state.bankedScore + newTurnTotal >= 100

      return {
        ...state,
        turnTotal: newTurnTotal,
        bustType: null,
        firstRoll: false,
        canHold: true,
        holdLabel: wouldWin ? `Hold & Win! (${newTurnTotal})` : `Hold (Bank ${newTurnTotal})`,
        celebration: null,
        banner: null,
        hint: wouldWin
          ? `Hold to win with ${state.bankedScore + newTurnTotal} points!`
          : newTurnTotal > 30
          ? `${newTurnTotal} at risk! Hold to bank safely?`
          : `${newTurnTotal} on the line. Push your luck?`,
        hud: buildPigHud(state.bankedScore, newTurnTotal),
      }
    }
    case 'HOLD': {
      const newBanked = state.bankedScore + state.turnTotal
      const won = newBanked >= 100

      if (won) {
        return {
          ...state,
          bankedScore: newBanked,
          turnTotal: 0,
          canRoll: false,
          canHold: false,
          holdLabel: '',
          celebration: 'victory',
          banner: { text: `YOU WIN! ${newBanked} POINTS!`, type: 'victory' },
          gameOver: true,
          gameOverMessage: `You banked ${newBanked} points!`,
          hint: '🎉 You did it!',
          hud: buildPigHud(newBanked, 0),
        }
      }

      return {
        ...state,
        bankedScore: newBanked,
        turnTotal: 0,
        canHold: false,
        canFinish: true,
        holdLabel: '',
        celebration: null,
        banner: { text: `Banked ${state.turnTotal}!`, type: 'hold' },
        hint: `${newBanked} banked. ${100 - newBanked} more to win!`,
        hud: buildPigHud(newBanked, 0),
      }
    }
    case 'FINISH': {
      const { bankedScore } = state
      return {
        ...state,
        canRoll: false,
        canHold: false,
        canFinish: false,
        gameOver: true,
        gameOverMessage: `Finished with ${bankedScore} banked points!`,
        celebration: null,
        banner: null,
        hint: `${bankedScore} points banked.`,
      }
    }
    case 'CLEAR_CELEBRATION':
      return { ...state, celebration: null, banner: null }
    case 'RESET':
      return pigInitial()
    default:
      return state
  }
}
