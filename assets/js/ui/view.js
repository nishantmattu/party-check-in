/**
 * All DOM reads/writes live here so the app logic stays UI-agnostic.
 */

const SCREENS = ['checkin', 'select', 'welcome', 'notfound', 'seating', 'error'];

const elements = {
  header: document.getElementById('app-header'),
  eventName: document.getElementById('event-name'),
  eventAccent: document.getElementById('event-accent'),
  form: document.getElementById('checkin-form'),
  input: document.getElementById('guest-name'),
  formError: document.getElementById('form-error'),
  matchList: document.getElementById('match-list'),
  welcomeHeading: document.getElementById('welcome-heading'),
  welcomeFamily: document.getElementById('welcome-family'),
  welcomeTable: document.getElementById('welcome-table'),
  welcomeNote: document.getElementById('welcome-note'),
  notFoundText: document.getElementById('notfound-text'),
  seatingChart: document.getElementById('seating-chart'),
};

const DEFAULT_NOT_FOUND_TEXT = elements.notFoundText.textContent.trim();

/** Show the event title; `accent` is an optional word set in script below it. */
export function setEventName(name, accent) {
  if (name) {
    elements.eventName.textContent = name;
  }
  elements.eventAccent.textContent = accent ?? '';
  elements.eventAccent.hidden = !accent;

  const fullName = [name, accent].filter(Boolean).join(' ');
  if (fullName) {
    document.title = `${fullName} · Check-In`;
  }
}

export function showScreen(name, { countdownMs } = {}) {
  for (const screen of SCREENS) {
    document.getElementById(`screen-${screen}`).hidden = screen !== name;
  }

  // The "Welcome to ..." header only belongs on the check-in screen.
  elements.header.hidden = name !== 'checkin';

  if (countdownMs) {
    startCountdown(document.getElementById(`screen-${name}`), countdownMs);
  }

  if (name === 'checkin') {
    elements.input.focus();
  }

  window.scrollTo(0, 0);
}

export function resetForm() {
  elements.form.reset();
  hideFormError();
}

export function getQuery() {
  return elements.input.value;
}

export function showFormError(message) {
  elements.formError.textContent = message;
  elements.formError.hidden = false;
  elements.input.focus();
}

export function hideFormError() {
  elements.formError.hidden = true;
  elements.formError.textContent = '';
}

export function renderWelcome(guest) {
  elements.welcomeHeading.textContent = guest.name;
  elements.welcomeFamily.replaceChildren(...guest.familyMembers.map(createListItem));
  elements.welcomeFamily.hidden = guest.familyMembers.length === 0;
  elements.welcomeTable.textContent = guest.table;
  elements.welcomeNote.textContent = guest.note;
  elements.welcomeNote.hidden = !guest.note;
}

export function renderMatches(guests, onSelect) {
  const items = guests.map((guest) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'match-list__button';

    button.textContent = guest.name;
    button.addEventListener('click', () => onSelect(guest));

    const item = document.createElement('li');
    item.append(button);
    return item;
  });

  elements.matchList.replaceChildren(...items);
}

export function renderSeatingChart(tables) {
  const sections = tables.map(({ table, families }) => {
    const section = document.createElement('section');
    section.className = 'seating-table';

    const heading = document.createElement('h3');
    heading.className = 'seating-table__heading';
    heading.textContent = `Table ${table}`;
    section.append(heading);

    for (const guests of families) {
      const guestList = document.createElement('ul');
      guestList.className = 'seating-table__guests';
      guestList.append(...guests.map(createListItem));
      section.append(guestList);
    }

    return section;
  });

  elements.seatingChart.replaceChildren(...sections);
}

/** Call handler whenever the guest touches or scrolls the page. */
export function onActivity(handler) {
  for (const type of ['pointerdown', 'scroll', 'keydown']) {
    window.addEventListener(type, handler, { passive: true });
  }
}

export function renderNotFound(message = DEFAULT_NOT_FOUND_TEXT) {
  elements.notFoundText.textContent = message;
}

export function onSubmit(handler) {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    handler();
  });
}

export function onInput(handler) {
  elements.input.addEventListener('input', handler);
}

/** Wire every [data-action] button in the page to a handler map. */
export function onAction(handlers) {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    const handler = target && handlers[target.dataset.action];
    if (handler) {
      handler();
    }
  });
}

function createListItem(text) {
  const item = document.createElement('li');
  item.textContent = text;
  return item;
}

function startCountdown(screen, durationMs) {
  const bar = screen.querySelector('.countdown__bar');
  if (!bar) {
    return;
  }
  bar.classList.remove('is-running');
  bar.style.setProperty('--countdown-duration', `${durationMs}ms`);
  void bar.offsetWidth; // force reflow so the animation restarts
  bar.classList.add('is-running');
}
