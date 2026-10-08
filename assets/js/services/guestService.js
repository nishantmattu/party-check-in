import { scoreMatch, tokenize } from '../utils/nameMatcher.js';

/**
 * Loads the guest list and answers name searches against it.
 */
export class GuestService {
  #event = {};
  #families = [];
  #guests = [];

  async load(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load guest list (${response.status})`);
    }

    const data = await response.json();
    this.#event = data.event ?? {};
    this.#families = data.families ?? [];
    this.#guests = flattenFamilies(this.#families);
  }

  get event() {
    return this.#event;
  }

  /**
   * Families grouped by table, in table order:
   * [{ table, families: [[guestName, ...], ...] }]
   */
  getSeatingChart() {
    const tables = new Map();
    for (const family of this.#families) {
      const key = String(family.table);
      if (!tables.has(key)) {
        tables.set(key, { table: family.table, families: [] });
      }
      tables.get(key).families.push(family.guests ?? []);
    }

    return [...tables.values()].sort((a, b) =>
      String(a.table).localeCompare(String(b.table), undefined, { numeric: true }),
    );
  }

  /**
   * Find guests whose name matches the query.
   * Results are sorted best match first.
   */
  search(query) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    const results = [];
    for (const guest of this.#guests) {
      const score = scoreMatch(queryTokens, guest.nameTokens);
      if (score > 0) {
        results.push({ guest, score });
      }
    }

    results.sort((a, b) => b.score - a.score || a.guest.name.localeCompare(b.guest.name));

    // An exact full-name match wins outright.
    const best = results[0];
    if (best && best.score >= 10 && results[1]?.score < 10) {
      return [best.guest];
    }

    return results.map((result) => result.guest);
  }
}

function flattenFamilies(families) {
  return families.flatMap((family) => {
    const members = family.guests ?? [];
    return members.map((name) => ({
      name,
      familyMembers: members.filter((member) => member !== name),
      table: family.table,
      note: family.note ?? '',
      nameTokens: tokenize(name),
    }));
  });
}
