import { CONFIG } from './config.js';
import { GuestService } from './services/guestService.js';
import * as view from './ui/view.js';

const guestService = new GuestService();
let resetTimer = null;
let isSeatingChartOpen = false;

async function init() {
  view.onSubmit(handleCheckIn);
  view.onInput(view.hideFormError);
  view.onAction({
    reset: resetToStart,
    reload: () => window.location.reload(),
    'seating-chart': showSeatingChart,
  });
  view.onActivity(() => {
    // Keep the chart open while the guest is still scrolling through it.
    if (isSeatingChartOpen) {
      scheduleReset(CONFIG.seatingChartTimeoutMs);
    }
  });

  try {
    await guestService.load(CONFIG.guestListUrl);
    view.setEventName(guestService.event.name, guestService.event.accent);
    view.showScreen('checkin');
  } catch (error) {
    console.error(error);
    view.showScreen('error');
  }
}

function handleCheckIn() {
  const query = view.getQuery().trim();

  if (query.length < CONFIG.minQueryLength) {
    view.showFormError('Please enter your name.');
    return;
  }

  const matches = guestService.search(query);

  if (matches.length === 0) {
    showNotFound();
  } else if (matches.length === 1) {
    showWelcome(matches[0]);
  } else if (matches.length <= CONFIG.maxMatchesToList) {
    showMatches(matches);
  } else {
    view.showFormError('Lots of guests match that — please enter your first and last name.');
  }
}

function showWelcome(guest) {
  view.renderWelcome(guest);
  view.showScreen('welcome', { countdownMs: CONFIG.resultScreenDurationMs });
  scheduleReset(CONFIG.resultScreenDurationMs);
}

function showMatches(guests) {
  view.renderMatches(guests, showWelcome);
  view.showScreen('select');
  scheduleReset(CONFIG.selectScreenTimeoutMs);
}

function showNotFound() {
  view.renderNotFound();
  view.showScreen('notfound', { countdownMs: CONFIG.resultScreenDurationMs });
  scheduleReset(CONFIG.resultScreenDurationMs);
}

function showSeatingChart() {
  view.renderSeatingChart(guestService.getSeatingChart());
  view.showScreen('seating');
  isSeatingChartOpen = true;
  scheduleReset(CONFIG.seatingChartTimeoutMs);
}

function resetToStart() {
  clearTimeout(resetTimer);
  isSeatingChartOpen = false;
  view.resetForm();
  view.showScreen('checkin');
}

function scheduleReset(delayMs) {
  clearTimeout(resetTimer);
  resetTimer = setTimeout(resetToStart, delayMs);
}

init();
