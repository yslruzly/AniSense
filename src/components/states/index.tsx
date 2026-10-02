import React from "react";

// ─── State primitives ─────────────────────────────────────────────────────────
// An app is judged on its worst state, not its best. These cover the three that
// a demo never has and a shipped app always does.
//
// Rules encoded here:
//   · An empty state says what's missing, WHY it's missing, and what to do next.
//     "Walang laman" alone is a dead end.
//   · A "no results" empty state is a different thing from a "nothing exists
//     yet" empty state, and must never reuse its copy: one means "you filtered
//     it away", the other means "you haven't started".
//   · Errors carry role="alert" so they're announced, and always offer a retry.
//   · Skeletons mirror the shape of the content that's coming, so the layout
//     doesn't jump when it lands.

export function EmptyState({
  icon, title, body, action, onAction,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="state-block">
      <div className="state-ico">{icon}</div>
      <p className="state-title">{title}</p>
      <p className="state-body">{body}</p>
      {action && onAction && (
        <button className="state-action" onClick={onAction}>{action}</button>
      )}
    </div>
  );
}

export function ErrorState({
  title, body, retryLabel, onRetry,
}: {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    // role="alert" so a screen reader announces the failure rather than leaving
    // the user waiting on a list that will never arrive.
    <div className="state-block state-error" role="alert">
      <div className="state-ico state-ico-error">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16.4v.1" />
        </svg>
      </div>
      <p className="state-title">{title}</p>
      <p className="state-body">{body}</p>
      <button className="state-action" onClick={onRetry}>{retryLabel}</button>
    </div>
  );
}

/** A single shimmering block. Width may be a % or px string. */
export function Skeleton({
  w = "100%", h = 16, radius = 8, style, className = "",
}: { w?: string | number; h?: number; radius?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <span
      className={`skel ${className}`}
      aria-hidden="true"
      style={{ width: w, height: h, borderRadius: radius, ...style }}
    />
  );
}

/** Mirrors .mkt-row: icon tile, two stacked lines, right-aligned price block. */
export function SkeletonRow() {
  return (
    <div className="mkt-row" aria-hidden="true">
      <Skeleton w={42} h={42} radius={12} />
      <div style={{ flex: 1 }}>
        <Skeleton w="58%" h={17} />
        <Skeleton w="34%" h={14} style={{ marginTop: 7 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
        <Skeleton w={62} h={18} />
        <Skeleton w={44} h={14} />
      </div>
    </div>
  );
}

/**
 * A skeleton list. `role="status"` + a visually-hidden label means the wait is
 * announced once, rather than silently.
 */
export function SkeletonList({ rows = 5, label }: { rows?: number; label: string }) {
  return (
    // .list-stack matches the spacing the real rows get from .scroll. Without
    // it the placeholders sat flush against each other and the list visibly
    // spread apart the moment the data landed — the exact layout jump a
    // skeleton exists to prevent.
    <div className="list-stack" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}

/**
 * Rows with a picture: a tile, two lines, and a price block at the end. The
 * shape of a Home row, a harvest row and a purchase or expense row, so the
 * list keeps its place when the real rows land.
 */
export function SkeletonMediaRows({ rows = 3, tile = 50, round = false, end = true, label }: {
  rows?: number;
  /** The picture tile's size, in px. */
  tile?: number;
  /** A round tile, for a person. */
  round?: boolean;
  /** Whether the row ends in a price block. */
  end?: boolean;
  label: string;
}) {
  return (
    <div className="skel-rows" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div className="skel-row" key={i} aria-hidden="true">
          <Skeleton w={tile} h={tile} radius={round ? tile / 2 : 13} style={{ flex: `0 0 ${tile}px` }} />
          <div className="skel-row-body">
            <Skeleton w={i % 2 ? "48%" : "62%"} h={16} />
            <Skeleton w={i % 2 ? "34%" : "42%"} h={13} />
          </div>
          {end && (
            <div className="skel-row-end">
              <Skeleton w={58} h={17} />
              <Skeleton w={40} h={13} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Marketplace cards: the same two-column grid, photo on top, three lines. */
export function SkeletonCards({ count = 6, label }: { count?: number; label: string }) {
  return (
    <div className="mp-grid" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <div className="mp-card is-skel" key={i} aria-hidden="true">
          <Skeleton h={0} radius={0} style={{ height: "auto", aspectRatio: "4 / 3" }} />
          <div className="mp-card-body">
            <Skeleton w="78%" h={15} />
            <Skeleton w="46%" h={18} />
            <Skeleton w="66%" h={12} />
            <Skeleton w="54%" h={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The featured shelf on Home: a row of small cards, photo on top. */
export function SkeletonShelf({ count = 3, label }: { count?: number; label: string }) {
  return (
    <div className="fp-row is-skel" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <div className="fp-card is-skel" key={i} aria-hidden="true">
          <Skeleton h={114} radius={0} />
          <div className="fp-body">
            <Skeleton w="80%" h={15} />
            <Skeleton w="50%" h={18} />
            <Skeleton w="64%" h={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
