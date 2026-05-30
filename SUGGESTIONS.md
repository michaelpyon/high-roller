# high-roller: Audience Pass Findings

## Evangelist

The ideal evangelist is a tabletop-gaming Discord regular (r/boardgames or a dedicated dice game server) in their 20s to 30s who plays physical dice games like Farkle, Yahtzee, or Pig at game nights but wants something to pull up on their phone mid-session to settle a "let's play" impulse without downloading an app. They currently use whatever dice roller is top of the App Store or just roll physical dice. They screenshot the game-over card with a high score or final round count and drop it in their Discord channel as a "beat this" challenge. They bounce in 5 seconds if: the first screen does not tell them what kind of dice game this is (it does), or if they tap a mode and nothing happens.

---

## Ground Truth (repo HEAD)

**All prior-pass fixes are confirmed in HEAD:**
- 6 game modes with full reducer logic: Free Roll, Race to Target, Pig, Sevens Out, Chicago, Mexico.
- End Run button exists on Free Roll and Mexico (`canFinish` + `FINISH` action).
- Share text is brag-worthy: `buildShareText` constructs a score-first shareable string with the URL `high-roller-eight.vercel.app`.
- Game-over overlay includes Play Again, Change Mode, Copy Result, and Share on X.
- No fabricated external data, no fake "real-time" claims, no Census/API calls, no invented facts.
- All data is purely in-browser random (Math.random) and localStorage for high scores.

**Live URL status:**
- `https://high-roller.vercel.app` returned 404 (not the canonical URL for this project).
- `https://high-roller-eight.vercel.app` loaded (React SPA shell confirmed). Live may be serving pre-fix build since commits were pushed but Vercel auto-deploy may have run. The OG meta, canonical, and share URL all point to `high-roller-eight.vercel.app`, which is consistent with the codebase.

**Bug found and fixed in this pass:**
- Sevens Out: when a player rolled a 7 on unbanked points, `isNewHigh` was computed and the `gameOverMessage` said "New record: X!" but `saveHighScore` was never called and `highScore` in state was never updated. This meant: (1) the high score was silently discarded on every game-over bust, (2) Play Again would reload from localStorage showing the stale lower value, (3) the HUD high score segment still showed the old value in gold. Fixed: `saveHighScore(newHigh)` is now called in the bust path, `highScore: newHigh` is written to the returned state, and the HUD segment style switches to `gold` for a new record bust. Hint copy also updated to be honest ("New record set before the bust!" instead of the misleading "So close to a new high score...").

---

## Prioritized Plan

### Quick Wins (S, no deploy needed to develop, deploy needed to go live)

**1. Sevens Out high-score bust bug (DONE, this pass)**
File: `src/modes/sevensOut.js`
A silent data loss bug: rolling a 7 on a new high score never persisted the record to localStorage or updated in-state. Evangelist impact: high, because high-score tracking is the competitive hook that drives re-play and sharing.
Effort: S. Deploy needed: yes (already committed + pushed).

**2. Race to Target: remember last target on Play Again**
File: `src/modes/raceToTarget.js`
Currently `RESET` calls `raceToTargetInitial()`, which sets `target: null` and forces the player to re-select the target. The better UX is to keep the last target. Change: pass `target` through RESET, defaulting to null only if explicitly clearing.
Effort: S.

**3. Pig: add "End run" button once player has banked > 0**
File: `src/modes/pig.js`, `GameShell.jsx`
Pig currently has no way to "finish" and get a game-over/share card except by winning at 100. A player who wants to share a partial session has no exit. Adding a `canFinish` path (matching Free Roll and Mexico) lets them see the share card after banking multiple turns. Low implementation risk.
Effort: S.

**4. Free Roll: show total rolls in HUD (not just on finish)**
File: `src/modes/freeRoll.js`
The streak shows only when there is a current streak. Total rolls and best streak are only surfaced on game-over. A small "Rolls: X / Best Streak: Y" HUD segment visible during play helps players see progress and gives a reason to share before ending the session.
Effort: S.

**5. Sevens Out: show total banked score on game-over card**
File: `src/modes/sevensOut.js`
The game-over message shows only the lost (unbanked) amount and the high score. But the total banked across the session is not tracked or shown. Adding a session total makes the game-over card more brag-worthy for players who multi-bank successfully.
Effort: M (requires adding a session total accumulator to the reducer).

---

### Bigger Bets (M-L)

**6. Keyboard shortcut: H to Hold in Sevens Out (not just Pig)**
File: `src/components/GameShell.jsx`
The keydown handler fires H-to-hold only when `mode.canHold` is true, so it already works for any mode with hold. But the hint text "Space to roll . H to hold" only shows when `mode.canHold`, which is correct. No code change needed; this is already complete.

**7. Mobile: sticky Roll button at bottom of viewport**
File: `src/index.css`
On small phones the button can end up off-screen if HUD or history is tall. Making the Roll button fixed/sticky at the bottom on mobile would improve one-handed play. Effort: M (requires layout restructure for the game container).

**8. Chicago: perfect-game celebration shares differently**
File: `src/modes/chicago.js`, `GameShell.jsx`
The perfect 11/11 game-over message is "Perfect 11/11! Incredible!" but the share text just extracts a number (11) and says "Chicago: 11 pts". A specific share string for perfect games ("I hit a perfect 11/11 in Chicago") would be more brag-worthy.
Effort: S-M.

**9. OG image: dynamic score in social preview**
File: would require Vercel OG or a different approach
Currently `og.png` is a static image. A dynamic OG that shows the game mode and score would make social shares more clickable. Large effort, requires a serverless function or Vercel OG integration.
Effort: L.

**10. Sound effects (optional toggle)**
Adding subtle click and celebration sounds would deepen the tactile feel for the core evangelist audience. Requires a sound library or Web Audio API work.
Effort: L.
