import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/hooks/useResource.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

// Exercise effect lifetimes with a deterministic clock, without a browser or
// extra dependencies. Restart runs React's cleanup-before-next-effect sequence.
function harness() {
  const states = [];
  const timers = new Map();
  let cursor = 0, effect, cleanup, now = 1000, nextTimer = 0;
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = initial;
      return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }];
    },
    useRef: value => ({ current: value }),
    useCallback: fn => fn,
    useEffect: fn => { effect = fn; },
  };
  const exports = {};
  runInNewContext(source, {
    exports,
    require: name => { assert.equal(name, 'react'); return react; },
    Date: { now: () => now },
    window: {
      setTimeout: (fn, ms) => { const id = ++nextTimer; timers.set(id, { fn, at: now + ms }); return id; },
      clearTimeout: id => timers.delete(id),
    },
  });
  const read = () => {
    cursor = 0;
    return exports.useResource(() => Promise.resolve());
  };
  return {
    read,
    start(fetcher) {
      cleanup?.();
      cursor = 0;
      exports.useResource(fetcher);
      cleanup = effect();
    },
    stop: () => cleanup?.(),
    pending: () => timers.size,
    advance(ms) {
      const end = now + ms;
      while (true) {
        const due = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]);
        now = due[1].at;
        due[1].fn();
      }
      now = end;
    },
  };
}

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test('an older response cannot replace a newer result', async () => {
  const h = harness(), old = deferred(), current = deferred();
  h.start(() => old.promise);
  h.start(() => current.promise);
  current.resolve('new');
  await flush();
  old.resolve('old');
  await flush();
  assert.equal(h.read().data, 'new');
  assert.equal(h.read().status, 'ready');
  assert.equal(h.pending(), 0);
});

test('an obsolete failure cannot turn a successful reload into an error', async () => {
  const h = harness(), old = deferred();
  h.start(() => old.promise);
  h.start(() => Promise.resolve('new'));
  await flush();
  old.reject(new Error('obsolete'));
  await flush();
  assert.equal(h.read().status, 'ready');
  assert.equal(h.read().error, null);
});

test('fast responses skip the skeleton; slow responses keep its minimum duration', async () => {
  const h = harness(), slow = deferred();
  h.start(() => Promise.resolve('fast'));
  await flush();
  h.advance(200);
  assert.equal(h.read().showSkeleton, false);
  h.start(() => slow.promise);
  h.advance(200);
  assert.equal(h.read().showSkeleton, true);
  slow.resolve('slow');
  await flush();
  h.advance(399);
  assert.equal(h.read().showSkeleton, true);
  h.advance(1);
  assert.equal(h.read().showSkeleton, false);
  assert.equal(h.read().data, 'slow');
});

test('reloading or unmounting cancels a delayed completion', async () => {
  const h = harness(), old = deferred(), current = deferred();
  h.start(() => old.promise);
  h.advance(200);
  old.resolve('old');
  await flush();
  h.start(() => current.promise);
  h.advance(400);
  assert.equal(h.read().data, null);
  current.resolve('current');
  await flush();
  h.stop();
  assert.equal(h.pending(), 0);
  h.advance(1000);
  assert.equal(h.read().data, null);
});
