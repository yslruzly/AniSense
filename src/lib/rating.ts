// ─── A farmer's rating ────────────────────────────────────────────────────────
// The average of the stars buyers gave after an order was settled on both
// sides (rate_order_item in schema.sql), with how many gave them. A farmer
// nobody has rated yet has a count of 0: the database keeps 5.0 in the
// rating, but that is a starting value, not a judgement, so the app says
// "New" and ranks them after every farmer buyers have actually rated.
// The demo's sample farmers carry no count and are taken as rated.

type Rated = { rating: number; ratingCount?: number };

/** No buyer has rated this farmer yet. */
export const unrated = (x: Rated): boolean => x.ratingCount === 0;

/** For "best-rated first": an unrated farmer comes after every rated one. */
export const rankOf = (x: Rated): number => (unrated(x) ? -1 : x.rating);

/** "4.8", or the word for new ("New") when nobody has rated them yet. */
export const ratingText = (x: Rated, newWord: string): string => (unrated(x) ? newWord : x.rating.toFixed(1));
