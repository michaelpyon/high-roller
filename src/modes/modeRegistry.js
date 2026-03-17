import { freeRollReducer, freeRollInitial } from './freeRoll'
import { raceToTargetReducer, raceToTargetInitial } from './raceToTarget'
import { pigReducer, pigInitial } from './pig'
import { sevensOutReducer, sevensOutInitial } from './sevensOut'
import { chicagoReducer, chicagoInitial } from './chicago'
import { mexicoReducer, mexicoInitial } from './mexico'

export const MODES = [
  {
    id: 'free-roll',
    name: 'Free Roll',
    description: 'Roll for lucky streaks',
    icon: '🎲',
    accent: '#3b82f6',
    reducer: freeRollReducer,
    initial: freeRollInitial,
  },
  {
    id: 'race-to-target',
    name: 'Race to Target',
    description: 'Hit the target score first',
    icon: '🎯',
    accent: '#10b981',
    reducer: raceToTargetReducer,
    initial: raceToTargetInitial,
  },
  {
    id: 'pig',
    name: 'Pig',
    description: 'Bank it or bust trying',
    icon: '🐷',
    accent: '#f97316',
    reducer: pigReducer,
    initial: pigInitial,
  },
  {
    id: 'sevens-out',
    name: 'Sevens Out',
    description: 'Cash out before you roll a 7',
    icon: '💀',
    accent: '#ef4444',
    reducer: sevensOutReducer,
    initial: sevensOutInitial,
  },
  {
    id: 'chicago',
    name: 'Chicago',
    description: 'Hit every target from 2 to 12',
    icon: '🏙️',
    accent: '#8b5cf6',
    reducer: chicagoReducer,
    initial: chicagoInitial,
  },
  {
    id: 'mexico',
    name: 'Mexico',
    description: 'Roll the highest score you can',
    icon: '🇲🇽',
    accent: '#eab308',
    reducer: mexicoReducer,
    initial: mexicoInitial,
  },
]

export function getModeById(id) {
  return MODES.find(m => m.id === id)
}
