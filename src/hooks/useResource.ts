import { useCallback, useEffect, useRef, useState } from "react";

// ─── useResource ──────────────────────────────────────────────────────────────
// The seam the state components hang off. Wrap anything async (including
// lib/cache.ts's cachedFetch) and get a status machine instead of three
// loose booleans that inevitably drift out of sync.
//
// The timing rules matter more than the fetching:
//
//   · Nothing shows for the first 200ms. On a warm cache a fetch resolves in
//     ~20ms, and a skeleton that appears and vanishes inside a single blink
//     reads as a glitch, worse than no feedback at all.
//   · Once a skeleton IS shown, it stays for at least 400ms. Otherwise a fetch
//     landing at 210ms produces a flash. Deliberately making the fast case
//     slightly slower makes the app feel steadier, not slower.
//
// These two numbers are why a flagship app feels calm while a prototype
// flickers.

const SKELETON_DELAY = 200;
const SKELETON_MIN = 400;

export type ResourceStatus = "idle" | "loading" | "ready" | "error";

export interface Resource<T> {
  status: ResourceStatus;
  /** True only when the wait has lasted long enough to be worth showing. */
  showSkeleton: boolean;
  data: T | null;
  error: unknown;
  /** Set when the value came from the offline cache rather than the network. */
  fromCache: boolean;
  updatedAt: string | null;
  reload: () => void;
}

export function useResource<T>(
  fetcher: () => Promise<T | { data: T; fromCache?: boolean; updatedAt?: string | null }>,
  deps: unknown[] = [],
): Resource<T> {
  const [status, setStatus] = useState<ResourceStatus>("idle");
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [fromCache, setFromCache] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const shownAt = useRef<number | null>(null);
  const alive = useRef(true);

  const reload = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    alive.current = true;
    setStatus("loading");
    setError(null);

    // Hold the skeleton back; most loads never reach this timer.
    shownAt.current = null;
    const delay = window.setTimeout(() => {
      if (!alive.current) return;
      shownAt.current = Date.now();
      setShowSkeleton(true);
    }, SKELETON_DELAY);

    const settle = (fn: () => void) => {
      const shown = shownAt.current;
      const remaining = shown ? SKELETON_MIN - (Date.now() - shown) : 0;
      const finish = () => {
        if (!alive.current) return;
        setShowSkeleton(false);
        fn();
      };
      if (remaining > 0) window.setTimeout(finish, remaining);
      else finish();
    };

    fetcher()
      .then(res => {
        const wrapped =
          res && typeof res === "object" && "data" in (res as Record<string, unknown>);
        const payload = wrapped ? (res as { data: T }).data : (res as T);
        const meta = wrapped ? (res as { fromCache?: boolean; updatedAt?: string | null }) : {};
        window.clearTimeout(delay);
        settle(() => {
          setData(payload);
          setFromCache(Boolean(meta.fromCache));
          setUpdatedAt(meta.updatedAt ?? null);
          setStatus("ready");
        });
      })
      .catch(err => {
        window.clearTimeout(delay);
        settle(() => {
          setError(err);
          setStatus("error");
        });
      });

    return () => {
      alive.current = false;
      window.clearTimeout(delay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return { status, showSkeleton, data, error, fromCache, updatedAt, reload };
}
