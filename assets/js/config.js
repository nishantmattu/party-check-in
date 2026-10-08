/**
 * App-wide settings. Adjust these without touching the rest of the code.
 */
export const CONFIG = Object.freeze({
  /** Path to the guest list, relative to index.html. */
  guestListUrl: 'data/guests.json',

  /** How long the welcome / not-found screens stay up before resetting (ms). */
  resultScreenDurationMs: 15000,

  /** Reset the "which one is you?" screen after this much inactivity (ms). */
  selectScreenTimeoutMs: 30000,

  /** Reset the seating chart after this much inactivity (ms). */
  seatingChartTimeoutMs: 60000,

  /** Minimum characters required before searching. */
  minQueryLength: 2,

  /** If a search returns more matches than this, ask for a more specific name. */
  maxMatchesToList: 6,
});
