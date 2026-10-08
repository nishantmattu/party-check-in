/**
 * Name normalization and matching helpers.
 *
 * Matching is forgiving so guests can type quickly on a tablet:
 * case, accents, punctuation and extra spaces are ignored, and each
 * word typed only needs to be the start of a word in the name
 * ("raj sh" matches "Raj Sharma").
 */

export function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(value) {
  const normalized = normalize(value);
  return normalized ? normalized.split(' ') : [];
}

/**
 * Score how well the query tokens match a candidate's tokens.
 * Returns 0 when there is no match; higher numbers are better matches.
 */
export function scoreMatch(queryTokens, candidateTokens) {
  if (queryTokens.length === 0 || candidateTokens.length === 0) {
    return 0;
  }

  let score = 0;
  for (const queryToken of queryTokens) {
    if (candidateTokens.includes(queryToken)) {
      score += 2; // whole-word match
    } else if (candidateTokens.some((token) => token.startsWith(queryToken))) {
      score += 1; // prefix match
    } else {
      return 0; // every word typed must match something
    }
  }

  const isExactFullMatch = queryTokens.join(' ') === candidateTokens.join(' ');
  return isExactFullMatch ? score + 10 : score;
}
